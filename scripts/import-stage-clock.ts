/**
 * Import a closed leg from Stage Clock into PARX Open results.
 *
 *   npm run import:stage-clock -- --leg ormoc            # live from Stage Clock (Firestore, public read)
 *   npm run import:stage-clock -- --leg ormoc --dry-run  # show what would change, write nothing
 *   npm run import:stage-clock -- --leg ormoc --from stage_clock_backup_2027-03-14.json
 *                                                        # from a Stage Clock "Reset event" backup file
 * Options: --force (import even if Stage Clock says it was closed for another leg),
 *          --summary <file> (write a Markdown summary, used by the GitHub Action).
 *
 * Writes content/results/{leg}.json (+ a raw snapshot in content/results/raw/), adds drivers seen for the
 * first time to teams.json, and fills empty car/number fields. Then validates all content.
 * Normally run by .github/workflows/stage-clock-import.yml when Stage Clock closes a leg.
 */
import fs from "node:fs";
import path from "node:path";
import { getLegs, getStageClockConfig, getDrivers } from "../lib/content";
import { mapStageClock, StageClockImportError, type MapResult } from "../lib/stage-clock/map";
import { decodeDriver, decodeSettings, type Driver, type RestDocument, type Settings } from "../lib/stage-clock/vendor";
import { TeamsFileSchema } from "../lib/types";

const args = process.argv.slice(2);
const arg = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const flag = (name: string) => args.includes(`--${name}`);

async function fetchStageClock(projectId: string, databaseId: string): Promise<{ drivers: Driver[]; settings: Settings; raw: unknown }> {
  const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents`;
  const [dRes, sRes] = await Promise.all([
    fetch(`${base}:runQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ structuredQuery: { from: [{ collectionId: "drivers" }] } }),
    }),
    fetch(`${base}/settings/global`),
  ]);
  if (!dRes.ok) throw new StageClockImportError(`Could not read Stage Clock entries (HTTP ${dRes.status}).`);
  const rows = (await dRes.json()) as { document?: RestDocument }[];
  const docs = rows.filter((r) => r.document).map((r) => r.document!);
  const settingsDoc = sRes.ok ? ((await sRes.json()) as RestDocument) : null;
  return { drivers: docs.map(decodeDriver), settings: decodeSettings(settingsDoc), raw: { drivers: docs, settings: settingsDoc } };
}

function fromBackup(file: string): { drivers: Driver[]; settings: Settings; raw: unknown } {
  const b = JSON.parse(fs.readFileSync(file, "utf8")) as { settings?: Partial<Settings>; drivers?: Driver[] };
  if (!Array.isArray(b.drivers)) throw new StageClockImportError(`${file} is not a Stage Clock backup (no "drivers" list).`);
  const s = b.settings ?? {};
  const settings: Settings = {
    dnfPenalty: typeof s.dnfPenalty === "number" ? s.dnfPenalty : 60,
    dnfCalculationMethod: s.dnfCalculationMethod === "overall" ? "overall" : "class",
    eventName: s.eventName,
    parxLegSlug: s.parxLegSlug,
    closedAt: s.closedAt,
  };
  return { drivers: b.drivers.map((d) => ({ ...d, stageTimes: d.stageTimes ?? {}, stagePenalties: d.stagePenalties ?? {} })), settings, raw: b };
}

function summaryMarkdown(leg: string, r: MapResult, dry: boolean) {
  const e = r.file.entries;
  const lines = [
    `## Stage Clock → PARX Open: ${leg}${dry ? " (dry run)" : ""}`,
    "",
    `- Event: ${r.file.source?.eventName ?? "—"} · closed: ${r.file.source?.closedAt ?? "not marked closed"}`,
    `- Stages: ${r.stageCount} · classified: ${e.filter((x) => x.status === "FIN").length} · DNF: ${e.filter((x) => x.status === "DNF").length} · DNS: ${e.filter((x) => x.status === "DNS").length} · skipped rows: ${r.skipped.length}`,
    "",
    "| Pos | Driver | Class | Total |",
    "| --- | --- | --- | --- |",
    ...e.slice(0, 10).map((x) => `| ${x.position ?? x.status} | ${x.driverSlug} #${x.carNumber ?? ""} | ${x.class ?? ""} | ${x.totalTime ?? "—"} |`),
  ];
  if (r.newDrivers.length) lines.push("", `### New drivers added to teams.json (${r.newDrivers.length})`, "", ...r.newDrivers.map((n) => `- **${n.displayName}** → \`${n.slug}\` (#${n.carNumber}, ${n.class}) — move to a team or add an alias in content/stage-clock.json if this is an existing driver`));
  if (r.profileUpdates.length) lines.push("", "### Profile fields filled", "", ...r.profileUpdates.map((u) => `- \`${u.slug}\`: ${u.field} = ${u.value}`));
  if (r.warnings.length) lines.push("", "### ⚠️ Check these", "", ...r.warnings.map((w) => `- ${w}`));
  if (r.skipped.length) lines.push("", "<details><summary>Skipped rows</summary>", "", ...r.skipped.map((s) => `- ${s.name} #${s.carNumber}: ${s.reason}`), "", "</details>");
  return lines.join("\n") + "\n";
}

async function main() {
  const leg = arg("leg");
  const dry = flag("dry-run");
  const legs = getLegs();
  if (!leg || !legs.some((l) => l.slug === leg)) throw new StageClockImportError(`Pass --leg with one of: ${legs.map((l) => l.slug).join(", ")}`);
  const config = getStageClockConfig();

  const src = arg("from") ? fromBackup(arg("from")!) : await fetchStageClock(config.firestore.projectId, config.firestore.databaseId);
  if (src.settings.parxLegSlug && src.settings.parxLegSlug !== leg && !flag("force"))
    throw new StageClockImportError(`Stage Clock was closed for leg "${src.settings.parxLegSlug}", not "${leg}". Use --force to import anyway.`);

  const roster = getDrivers().map((d) => ({ slug: d.slug, displayName: d.displayName, number: d.number, car: d.car }));
  const result = mapStageClock({ drivers: src.drivers, settings: src.settings, legSlug: leg, roster, config });
  const md = summaryMarkdown(leg, result, dry);
  console.log(md);
  if (arg("summary")) fs.appendFileSync(arg("summary")!, md);
  if (dry) return;

  const root = process.cwd();
  fs.mkdirSync(path.join(root, "content/results/raw"), { recursive: true });
  fs.writeFileSync(path.join(root, `content/results/${leg}.json`), JSON.stringify(result.file, null, 2) + "\n");
  fs.writeFileSync(path.join(root, `content/results/raw/${leg}.stage-clock.json`), JSON.stringify({ fetchedAt: new Date().toISOString(), ...(src.raw as object) }, null, 2) + "\n");

  // teams.json: add new drivers, fill empty car/number.
  const teamsPath = path.join(root, "content/teams.json");
  const teamsFile = TeamsFileSchema.parse(JSON.parse(fs.readFileSync(teamsPath, "utf8")));
  const target = teamsFile.teams.find((t) => t.slug === config.newDriverTeam)!;
  for (const n of result.newDrivers)
    target.drivers.push({ slug: n.slug, displayName: n.displayName, surname: null, car: n.car, number: /^\d+$/.test(n.carNumber) ? Number(n.carNumber) : null, hometown: null, class: n.class });
  for (const u of result.profileUpdates) {
    const d = teamsFile.teams.flatMap((t) => t.drivers).find((x) => x.slug === u.slug)!;
    if (u.field === "car") d.car = String(u.value);
    else d.number = Number(u.value);
  }
  fs.writeFileSync(teamsPath, JSON.stringify(teamsFile, null, 2) + "\n");
  console.log(`✅ Wrote content/results/${leg}.json (${result.file.entries.length} entries)`);
}

main().catch((e) => {
  console.error(e instanceof StageClockImportError ? `\n❌ ${e.message}\n` : e);
  process.exit(1);
});
