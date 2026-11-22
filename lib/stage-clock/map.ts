/**
 * Stage Clock → PARX results mapping (pure; no I/O).
 *
 * Rules (see STAGE_CLOCK.md):
 * - Hidden rows (Stage Clock's "disqualify/hide", also used for test and duplicate rows) and names in
 *   `ignore` are skipped. Real DSQs can be set by hand in the results file afterwards.
 * - Times are Stage Clock's own effective times (penalties added, DNF/DNS replaced by the slowest
 *   time + DNF penalty, dropped runs not counted), computed with its vendored calculation.
 * - An entry with no times, or only DNS, is DNS. An entry missing a time on a stage that others ran is
 *   incomplete: imported as DNF (unclassified, 0 points) with a warning, so a crew that skipped stages
 *   can never top the classification.
 * - Classified entries are ranked overall by total time (PARX points are overall); class positions are kept too.
 */
import { formatTime } from "../standings";
import type { ResultsFile, StageClockConfig, StageFlag } from "../types";
import { computeResults, type Driver as ScDriver, type Settings as ScSettings } from "./vendor";

export interface RosterDriver {
  slug: string;
  displayName: string;
  number: number | null;
  car: string | null;
}

export interface MapResult {
  file: ResultsFile;
  stageCount: number;
  newDrivers: { slug: string; displayName: string; carNumber: string; car: string | null; class: string }[];
  profileUpdates: { slug: string; field: "car" | "number"; value: string | number }[];
  matched: { name: string; carNumber: string; slug: string; via: "alias" | "name" | "number" | "new" }[];
  skipped: { name: string; carNumber: string; reason: string }[];
  warnings: string[];
}

export class StageClockImportError extends Error {}

export const normName = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "driver";
const tidyName = (s: string) => {
  const t = s.trim().replace(/\s+/g, " ");
  return t === t.toUpperCase() || t === t.toLowerCase() ? t.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase()) : t;
};

export function mapStageClock(opts: {
  drivers: ScDriver[];
  settings: ScSettings;
  legSlug: string;
  roster: RosterDriver[];
  config: Pick<StageClockConfig, "aliases" | "ignore">;
  now?: Date;
}): MapResult {
  const { settings, legSlug, roster, config } = opts;
  const warnings: string[] = [];
  const skipped: MapResult["skipped"] = [];
  const ignore = new Set(config.ignore.map(normName));

  const considered = opts.drivers.filter((d) => {
    if (ignore.has(normName(d.name))) {
      skipped.push({ name: d.name, carNumber: d.carNumber, reason: "in ignore list" });
      return false;
    }
    return true;
  });
  const visible = considered.filter((d) => {
    if (d.isHidden) skipped.push({ name: d.name, carNumber: d.carNumber, reason: "hidden in Stage Clock" });
    return !d.isHidden;
  });
  if (!visible.length) throw new StageClockImportError("Stage Clock has no visible entries — nothing to import (was the event already reset?).");

  // Stages run = 1..highest stage any visible crew has a time/DNF/DNS for.
  const maxStage = Math.max(...visible.flatMap((d) => Object.keys(d.stageTimes ?? {}).map(Number)).filter((n) => n >= 1 && n <= 12), 0);
  if (!maxStage) throw new StageClockImportError("No stage times found in Stage Clock.");
  const stages = Array.from({ length: maxStage }, (_, i) => i + 1);
  const ranStage = (s: number) => visible.some((d) => d.stageTimes?.[String(s)] !== undefined);

  const { processed } = computeResults(considered, settings, stages);
  const byId = new Map(processed.map((p) => [p.id, p]));

  // ---- Driver matching
  const aliases = new Map(Object.entries(config.aliases).map(([k, v]) => [normName(k), v]));
  const byName = new Map<string, RosterDriver>();
  for (const r of roster) {
    byName.set(normName(r.displayName), r);
    byName.set(normName(r.slug), r);
  }
  const rosterSlugs = new Set(roster.map((r) => r.slug));
  const newDrivers: MapResult["newDrivers"] = [];
  const matched: MapResult["matched"] = [];
  const profileUpdates: MapResult["profileUpdates"] = [];
  const usedSlugs = new Map<string, string>(); // slug -> "name #car" (duplicate guard)

  const resolve = (d: ScDriver): string => {
    const key = normName(d.name);
    const alias = aliases.get(key);
    if (alias) {
      if (!rosterSlugs.has(alias)) throw new StageClockImportError(`Alias "${d.name}" → "${alias}" points to a driver that is not in teams.json.`);
      matched.push({ name: d.name, carNumber: d.carNumber, slug: alias, via: "alias" });
      return alias;
    }
    const hit = byName.get(key);
    if (hit) {
      matched.push({ name: d.name, carNumber: d.carNumber, slug: hit.slug, via: "name" });
      return hit.slug;
    }
    const num = /^\d+$/.test(d.carNumber) ? Number(d.carNumber) : null;
    const byNum = num != null ? roster.filter((r) => r.number === num) : [];
    if (byNum.length === 1) {
      matched.push({ name: d.name, carNumber: d.carNumber, slug: byNum[0].slug, via: "number" });
      return byNum[0].slug;
    }
    // New driver → added to the configured team (Independent by default).
    const existingNew = newDrivers.find((n) => normName(n.displayName) === key);
    if (existingNew) return existingNew.slug;
    let slug = slugify(d.name);
    for (let i = 2; rosterSlugs.has(slug) || newDrivers.some((n) => n.slug === slug); i++) slug = `${slugify(d.name)}-${i}`;
    newDrivers.push({ slug, displayName: tidyName(d.name), carNumber: d.carNumber, car: d.carModel ?? null, class: d.class });
    matched.push({ name: d.name, carNumber: d.carNumber, slug, via: "new" });
    return slug;
  };

  type Row = {
    slug: string;
    d: ScDriver;
    status: "FIN" | "DNF" | "DNS";
    totalMs: number | null;
    stageTimes: (string | null)[];
    stageFlags: (StageFlag | null)[];
  };
  const rows: Row[] = visible.map((d) => {
    const slug = resolve(d);
    const prev = usedSlugs.get(slug);
    if (prev)
      throw new StageClockImportError(
        `Two visible Stage Clock entries map to the same driver "${slug}": ${prev} and ${d.name} #${d.carNumber} (${d.class}). Hide the wrong one in Stage Clock, or add one of the names to "ignore" in content/stage-clock.json.`,
      );
    usedSlugs.set(slug, `${d.name} #${d.carNumber} (${d.class})`);

    const p = byId.get(d.id)!;
    const raw = stages.map((s) => d.stageTimes?.[String(s)]);
    const dropped = new Set(d.droppedStages ?? []);
    const stageFlags = stages.map((s, i): StageFlag | null => {
      const t = raw[i];
      if (t === undefined) return null;
      if (dropped.has(String(s))) return "DROPPED";
      if (t === -1) return "DNF";
      if (t === -2) return "DNS";
      if ((d.stagePenalties?.[String(s)] ?? 0) > 0) return "PENALTY";
      return null;
    });
    const stageTimes = stages.map((s, i) => {
      const eff = p.effectiveStageTimes[String(s)];
      return raw[i] === undefined || !(eff > 0) ? null : formatTime(Math.round(eff * 1000));
    });
    const defined = raw.filter((t) => t !== undefined);
    let status: Row["status"] = "FIN";
    if (!defined.length || defined.every((t) => t === -2)) status = "DNS";
    else {
      const missing = stages.filter((s, i) => raw[i] === undefined && ranStage(s));
      if (missing.length) {
        status = "DNF";
        warnings.push(`${d.name} #${d.carNumber} (${d.class}) has no time on ${missing.map((s) => `SS${s}`).join(", ")} — imported as DNF (unclassified). Enter DNF/DNS for those stages in Stage Clock and re-import if they should be classified.`);
      }
    }
    return { slug, d, status, totalMs: status === "FIN" ? Math.round(p.effectiveTotal * 1000) : null, stageTimes, stageFlags };
  });

  // Overall ranking (classified only). Ties → car number, then name, with a warning.
  const fin = rows.filter((r) => r.status === "FIN").sort((a, b) => a.totalMs! - b.totalMs! || a.d.carNumber.localeCompare(b.d.carNumber, undefined, { numeric: true }) || a.d.name.localeCompare(b.d.name));
  fin.forEach((r, i) => {
    if (i && r.totalMs === fin[i - 1].totalMs) warnings.push(`Tie on total time between ${fin[i - 1].d.name} and ${r.d.name}; ordered by car number. Adjust positions by hand if the stewards decide otherwise.`);
  });
  const classPos = new Map<Row, number>();
  for (const cls of new Set(fin.map((r) => r.d.class.trim().toUpperCase()))) fin.filter((r) => r.d.class.trim().toUpperCase() === cls).forEach((r, i) => classPos.set(r, i + 1));

  // Profile fill-ins for existing drivers (only where PARX has nothing yet).
  for (const r of rows) {
    const ros = roster.find((x) => x.slug === r.slug);
    if (!ros) continue;
    if (ros.car == null && r.d.carModel) profileUpdates.push({ slug: r.slug, field: "car", value: r.d.carModel });
    if (ros.number == null && /^\d+$/.test(r.d.carNumber)) profileUpdates.push({ slug: r.slug, field: "number", value: Number(r.d.carNumber) });
  }

  const order = [...fin, ...rows.filter((r) => r.status === "DNF"), ...rows.filter((r) => r.status === "DNS")];
  const file: ResultsFile = {
    legSlug,
    sample: false,
    source: {
      system: "stage-clock",
      importedAt: (opts.now ?? new Date()).toISOString(),
      eventName: settings.eventName ?? null,
      closedAt: settings.closedAt ?? null,
      dnfPenaltySeconds: settings.dnfPenalty,
      dnfCalculationMethod: settings.dnfCalculationMethod === "overall" ? "overall" : "class",
    },
    entries: order.map((r) => ({
      driverSlug: r.slug,
      position: r.status === "FIN" ? fin.indexOf(r) + 1 : null,
      status: r.status,
      stageTimes: r.stageTimes,
      stageFlags: r.stageFlags.some(Boolean) ? r.stageFlags : undefined,
      totalTime: r.totalMs != null ? formatTime(r.totalMs) : undefined,
      class: r.d.class.trim().toUpperCase(),
      classPosition: classPos.get(r) ?? null,
      carNumber: r.d.carNumber,
      car: r.d.carModel ?? null,
    })),
  };
  return { file, stageCount: maxStage, newDrivers, profileUpdates, matched, skipped, warnings };
}
