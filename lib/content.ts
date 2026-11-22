/**
 * Server-only content loader. Reads /content, validates with zod and
 * cross-checks references (e.g. every result points at a real driver).
 * Any problem throws during `next build` with a readable message.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { z } from "zod";
import {
  ArticleFrontmatterSchema,
  CompeteSchema,
  HostSchema,
  StageClockConfigSchema,
  LegsFileSchema,
  MerchFileSchema,
  PointsTableSchema,
  ResultsFileSchema,
  SiteSchema,
  SponsorsFileSchema,
  SponsorshipSchema,
  TeamsFileSchema,
  type Article,
  type Driver,
  type Leg,
  type ResultsFile,
  type Sponsor,
  type SponsorTier,
} from "./types";

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, "content");

export class ContentError extends Error {
  constructor(file: string, detail: string) {
    super(`\n\n❌ Content error in content/${file}\n${detail}\n`);
    this.name = "ContentError";
  }
}

function parseFile<S extends z.ZodTypeAny>(file: string, schema: S, raw?: unknown): z.infer<S> {
  let data = raw;
  if (data === undefined) {
    const text = fs.readFileSync(path.join(CONTENT, file), "utf8");
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new ContentError(file, `Invalid JSON: ${(e as Error).message}\nTip: check for a missing comma or a trailing comma.`);
    }
  }
  const res = schema.safeParse(data);
  if (!res.success) {
    const lines = res.error.issues.map((i) => `  • ${i.path.join(".") || "(root)"}: ${i.message}`);
    throw new ContentError(file, lines.join("\n"));
  }
  return res.data;
}

const cache = new Map<string, unknown>();
function memo<T>(key: string, fn: () => T): T {
  if (process.env.NODE_ENV === "production" && cache.has(key)) return cache.get(key) as T;
  const v = fn();
  cache.set(key, v);
  return v;
}

/* ------------------------------------------------------------------ Site */
export const getSite = () => memo("site", () => parseFile("site.json", SiteSchema));
export const getPoints = () => memo("points", () => parseFile("points.json", PointsTableSchema));
export const getCompete = () => memo("compete", () => parseFile("compete.json", CompeteSchema));
export const getHost = () => memo("host", () => parseFile("host.json", HostSchema));
export const getSponsorship = () => memo("sponsorship", () => parseFile("sponsorship.json", SponsorshipSchema));
export const getMerch = () =>
  memo("merch", () => {
    const m = parseFile("merch.json", MerchFileSchema);
    const legSlugs = new Set(getLegs().map((l) => l.slug));
    m.items.forEach((it, i) => {
      if (it.legSlug && !legSlugs.has(it.legSlug))
        throw new ContentError("merch.json", `  • items.${i}.legSlug: unknown leg "${it.legSlug}"`);
    });
    return m.items;
  });

/* ------------------------------------------------------------------ Legs */
export const getLegs = (): Leg[] =>
  memo("legs", () => {
    const f = parseFile("legs.json", LegsFileSchema);
    const seen = new Set<string>();
    const rounds = new Set<number>();
    for (const l of f.legs) {
      if (seen.has(l.slug)) throw new ContentError("legs.json", `  • duplicate leg slug "${l.slug}"`);
      if (rounds.has(l.round)) throw new ContentError("legs.json", `  • duplicate round ${l.round}`);
      seen.add(l.slug);
      rounds.add(l.round);
    }
    return f.legs
      .map((l) => ({ ...l, schedule: l.schedule ?? f.defaultSchedule }))
      .sort((a, b) => a.round - b.round);
  });
export const getLeg = (slug: string) => getLegs().find((l) => l.slug === slug);

/* --------------------------------------------------------- Teams/Drivers */
export const getTeams = () =>
  memo("teams", () => {
    const f = parseFile("teams.json", TeamsFileSchema);
    const slugs = new Set<string>();
    const teamSlugs = new Set<string>();
    for (const t of f.teams) {
      if (teamSlugs.has(t.slug)) throw new ContentError("teams.json", `  • duplicate team slug "${t.slug}"`);
      teamSlugs.add(t.slug);
      for (const d of t.drivers) {
        if (slugs.has(d.slug))
          throw new ContentError("teams.json", `  • duplicate driver slug "${d.slug}" — every driver needs a unique slug (e.g. ian-m, ian-a)`);
        slugs.add(d.slug);
      }
      if (t.principalDriverSlug && !t.drivers.some((d) => d.slug === t.principalDriverSlug))
        throw new ContentError("teams.json", `  • ${t.slug}.principalDriverSlug "${t.principalDriverSlug}" is not in that team's drivers`);
    }
    // Independents always render last.
    return [...f.teams].sort((a, b) => Number(a.independent) - Number(b.independent));
  });
export const getTeam = (slug: string) => getTeams().find((t) => t.slug === slug);

export const getDrivers = (): Driver[] =>
  memo("drivers", () =>
    getTeams().flatMap((t) =>
      t.drivers.map((d) => ({
        ...d,
        teamSlug: t.slug,
        teamName: t.name,
        independent: t.independent,
        isPrincipal: t.principalDriverSlug === d.slug,
      })),
    ),
  );
export const getDriver = (slug: string) => getDrivers().find((d) => d.slug === slug);

/* --------------------------------------------------------------- Results */
export const getResultsFiles = (): ResultsFile[] =>
  memo("results", () => {
    const dir = path.join(CONTENT, "results");
    if (!fs.existsSync(dir)) return [];
    const legSlugs = new Set(getLegs().map((l) => l.slug));
    const driverSlugs = new Set(getDrivers().map((d) => d.slug));
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => {
        const file = `results/${f}`;
        const r = parseFile(file, ResultsFileSchema);
        if (!legSlugs.has(r.legSlug)) throw new ContentError(file, `  • legSlug "${r.legSlug}" is not a leg in legs.json`);
        const seen = new Set<string>();
        const positions: number[] = [];
        r.entries.forEach((e, i) => {
          if (!driverSlugs.has(e.driverSlug))
            throw new ContentError(file, `  • entries.${i}.driverSlug "${e.driverSlug}" is not a driver in teams.json`);
          if (seen.has(e.driverSlug)) throw new ContentError(file, `  • driver "${e.driverSlug}" appears twice`);
          seen.add(e.driverSlug);
          if (e.status === "FIN" && e.position == null)
            throw new ContentError(file, `  • entries.${i}: finishers (status FIN) need a position`);
          if (e.status !== "FIN" && e.position != null)
            throw new ContentError(file, `  • entries.${i}: ${e.status} entries must have "position": null`);
          if (e.position != null) positions.push(e.position);
          if (e.stageTimes.length !== r.entries[0].stageTimes.length)
            throw new ContentError(file, `  • entries.${i}: every entry needs the same number of stage times (${r.entries[0].stageTimes.length}); use null for stages without a time`);
          if (e.stageFlags && e.stageFlags.length !== e.stageTimes.length)
            throw new ContentError(file, `  • entries.${i}.stageFlags must have one value per stage (${e.stageTimes.length})`);
        });
        positions.sort((a, b) => a - b).forEach((p, i) => {
          if (p !== i + 1) throw new ContentError(file, `  • positions must run 1, 2, 3… without gaps or repeats (problem near P${p})`);
        });
        return r;
      });
  });
export const getResultsForLeg = (legSlug: string) => getResultsFiles().find((r) => r.legSlug === legSlug);

/* ----------------------------------------------------------- Stage Clock */
export const getStageClockConfig = () =>
  memo("stageclock", () => {
    const c = parseFile("stage-clock.json", StageClockConfigSchema);
    const driverSlugs = new Set(getDrivers().map((d) => d.slug));
    for (const [name, slug] of Object.entries(c.aliases))
      if (!driverSlugs.has(slug)) throw new ContentError("stage-clock.json", `  • aliases."${name}": "${slug}" is not a driver in teams.json`);
    if (!getTeams().some((t) => t.slug === c.newDriverTeam)) throw new ContentError("stage-clock.json", `  • newDriverTeam "${c.newDriverTeam}" is not a team in teams.json`);
    return c;
  });

/* -------------------------------------------------------------- Sponsors */
export const TIER_ORDER: SponsorTier[] = ["title", "gold", "silver", "bronze", "local"];
export const TIER_LABEL: Record<SponsorTier, string> = {
  title: "Title Partner",
  gold: "Gold Partners",
  silver: "Silver Partners",
  bronze: "Bronze Partners",
  local: "Local Partners",
};

export const getSponsors = (): Sponsor[] =>
  memo("sponsors", () => {
    const f = parseFile("sponsors.json", SponsorsFileSchema);
    const legSlugs = new Set(getLegs().map((l) => l.slug));
    f.sponsors.forEach((s, i) => {
      if (Array.isArray(s.legs))
        s.legs.forEach((l) => {
          if (!legSlugs.has(l)) throw new ContentError("sponsors.json", `  • sponsors.${i}.legs: unknown leg "${l}"`);
        });
    });
    return [...f.sponsors].sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier));
  });

/** Sponsors grouped by tier (always in tier order). Pass a leg slug to get that leg's sponsors (season + leg-specific). */
export function getSponsorsByTier(opts: { legSlug?: string; tiers?: SponsorTier[] } = {}) {
  const list = getSponsors().filter((s) => !opts.legSlug || s.legs === "season" || s.legs.includes(opts.legSlug));
  return (opts.tiers ?? TIER_ORDER)
    .map((tier) => ({ tier, label: TIER_LABEL[tier], sponsors: list.filter((s) => s.tier === tier) }))
    .filter((g) => g.sponsors.length > 0);
}

/* ------------------------------------------------------------------ News */
const NEWS_DIR = path.join(CONTENT, "news");
export const getArticles = (): Article[] =>
  memo("articles", () => {
    if (!fs.existsSync(NEWS_DIR)) return [];
    return fs
      .readdirSync(NEWS_DIR)
      .filter((f) => /\.mdx?$/.test(f))
      .map((f) => {
        const raw = fs.readFileSync(path.join(NEWS_DIR, f), "utf8");
        const { data, content } = matter(raw);
        const fm = parseFile(`news/${f}`, ArticleFrontmatterSchema, data);
        const words = content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
        return { ...fm, slug: f.replace(/\.mdx?$/, ""), body: content, readMinutes: Math.max(1, Math.round(words / 220)) };
      })
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)));
  });
export const getArticle = (slug: string) => getArticles().find((a) => a.slug === slug);

/* ---------------------------------------------------------------- Photos */
/**
 * Photo convention: /public/images/drivers/{slug}.jpg and /public/images/cars/{slug}.jpg.
 * Returns the public path when the file exists, otherwise null (→ branded placeholder).
 */
export function photo(kind: "drivers" | "cars" | "teams" | "legs" | "merch", slug: string): string | null {
  for (const ext of ["jpg", "webp", "png"]) {
    const rel = `/images/${kind}/${slug}.${ext}`;
    if (fs.existsSync(path.join(ROOT, "public", rel))) return rel;
  }
  return null;
}
export function publicFileExists(p: string | null | undefined) {
  return !!p && fs.existsSync(path.join(ROOT, "public", p));
}
