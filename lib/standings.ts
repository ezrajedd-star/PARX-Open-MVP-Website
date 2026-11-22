/**
 * Championship maths — derived entirely from results + points config.
 * Nothing in here is ever typed in by hand.
 */
import type { PointsTable, ResultInput, ResultStatus, ResultsFile } from "./types";

export function parseTime(t: string | null | undefined): number | null {
  if (!t) return null;
  const parts = t.split(":");
  const sec = parseFloat(parts.pop()!);
  const min = parts.length ? parseInt(parts.pop()!, 10) : 0;
  const hr = parts.length ? parseInt(parts.pop()!, 10) : 0;
  return Math.round(((hr * 60 + min) * 60 + sec) * 1000);
}

export function formatTime(ms: number | null): string {
  if (ms == null) return "—";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = ((ms % 60000) / 1000).toFixed(3).padStart(6, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}
export const formatGap = (ms: number | null) => (ms == null ? "—" : ms === 0 ? "—" : `+${formatTime(ms).replace(/^0:/, "")}`);

export function pointsFor(r: Pick<ResultInput, "position" | "status">, table: PointsTable): number {
  if (r.status !== "FIN") return table.statusPoints[r.status as Exclude<ResultStatus, "FIN">] ?? 0;
  return (r.position && table.positions[r.position - 1]) || 0;
}

export function totalMs(r: ResultInput): number | null {
  if (r.totalTime) return parseTime(r.totalTime);
  if (r.status !== "FIN") return null;
  const t = r.stageTimes.map(parseTime);
  return t.every((x) => x != null) ? (t as number[]).reduce((a, b) => a + b, 0) : null;
}

/* ------------------------------------------------------- Leg classification */
export interface ClassifiedRow {
  driverSlug: string;
  position: number | null;
  status: ResultStatus;
  totalMs: number | null;
  gapMs: number | null;
  points: number;
  stageMs: (number | null)[];
  class: string | null;
  /** Fastest time on each stage across the field. */
  stageBest: boolean[];
}

export function classify(file: ResultsFile, table: PointsTable): ClassifiedRow[] {
  const rows = file.entries.map((e) => ({
    driverSlug: e.driverSlug,
    position: e.position,
    status: e.status,
    totalMs: totalMs(e),
    gapMs: null as number | null,
    points: pointsFor(e, table),
    stageMs: e.stageTimes.map(parseTime),
    class: e.class ?? null,
    stageBest: [] as boolean[],
  }));
  const statusRank: Record<ResultStatus, number> = { FIN: 0, DNF: 1, DSQ: 2, DNS: 3 };
  rows.sort((a, b) => statusRank[a.status] - statusRank[b.status] || (a.position ?? 999) - (b.position ?? 999));
  const leader = rows.find((r) => r.position === 1)?.totalMs ?? null;
  const best = Array.from({ length: 8 }, (_, i) => Math.min(...rows.map((r) => r.stageMs[i] ?? Infinity)));
  for (const r of rows) {
    r.gapMs = r.status === "FIN" && leader != null && r.totalMs != null ? r.totalMs - leader : null;
    r.stageBest = r.stageMs.map((t, i) => t != null && t === best[i]);
  }
  return rows;
}

/* --------------------------------------------------------------- Standings */
export interface LegCell {
  points: number;
  position: number | null;
  status: ResultStatus;
}
export interface StandingRow {
  id: string;
  position: number;
  total: number;
  perLeg: Record<string, LegCell | null>;
  /** Positive = moved up since the previous round. null = no previous round. */
  movement: number | null;
}

interface Scored {
  id: string;
  perLeg: Record<string, LegCell | null>;
}

/** Sort by total, then countback (most wins, then most 2nds…), then id for stability. */
function rank(rows: Scored[], legOrder: string[]): (Scored & { total: number; position: number })[] {
  const withTotal = rows.map((r) => {
    const cells = legOrder.map((l) => r.perLeg[l]).filter(Boolean) as LegCell[];
    const finishes = cells.map((c) => c.position ?? 999).sort((a, b) => a - b);
    return { ...r, total: cells.reduce((a, c) => a + c.points, 0), finishes };
  });
  withTotal.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    for (let i = 0; i < Math.max(a.finishes.length, b.finishes.length); i++) {
      const d = (a.finishes[i] ?? 999) - (b.finishes[i] ?? 999);
      if (d) return d;
    }
    return a.id.localeCompare(b.id);
  });
  return withTotal.map(({ finishes: _f, ...r }, i) => ({ ...r, position: i + 1 }));
}

function withMovement(rows: Scored[], legOrder: string[]): StandingRow[] {
  const ran = legOrder.filter((l) => rows.some((r) => r.perLeg[l]));
  const now = rank(rows, ran);
  if (ran.length < 2) return now.map((r) => ({ ...r, movement: null }));
  const prevOrder = ran.slice(0, -1);
  const prevRows = rows.filter((r) => prevOrder.some((l) => r.perLeg[l]));
  const prev = new Map(rank(prevRows, prevOrder).map((r) => [r.id, r.position]));
  return now.map((r) => ({ ...r, movement: prev.has(r.id) ? prev.get(r.id)! - r.position : null }));
}

export function driverStandings(files: ResultsFile[], legOrder: string[], table: PointsTable): StandingRow[] {
  const map = new Map<string, Scored>();
  for (const f of files) {
    for (const e of f.entries) {
      const row = map.get(e.driverSlug) ?? { id: e.driverSlug, perLeg: Object.fromEntries(legOrder.map((l) => [l, null])) };
      row.perLeg[f.legSlug] = { points: pointsFor(e, table), position: e.position, status: e.status };
      map.set(e.driverSlug, row);
    }
  }
  return withMovement([...map.values()], legOrder);
}

/** Team points per leg = sum of the best `teamScoringDrivers` driver scores from that team. */
export function teamStandings(
  files: ResultsFile[],
  legOrder: string[],
  table: PointsTable,
  driverTeam: Record<string, string | null>,
): StandingRow[] {
  const map = new Map<string, Scored>();
  for (const f of files) {
    const byTeam = new Map<string, LegCell[]>();
    for (const e of f.entries) {
      const team = driverTeam[e.driverSlug];
      if (!team) continue;
      const arr = byTeam.get(team) ?? [];
      arr.push({ points: pointsFor(e, table), position: e.position, status: e.status });
      byTeam.set(team, arr);
    }
    for (const [team, cells] of byTeam) {
      const scoring = [...cells].sort((a, b) => b.points - a.points).slice(0, table.teamScoringDrivers ?? cells.length);
      const bestPos = Math.min(...cells.map((c) => c.position ?? 999));
      const row = map.get(team) ?? { id: team, perLeg: Object.fromEntries(legOrder.map((l) => [l, null])) };
      row.perLeg[f.legSlug] = {
        points: scoring.reduce((a, c) => a + c.points, 0),
        position: bestPos === 999 ? null : bestPos,
        status: "FIN",
      };
      map.set(team, row);
    }
  }
  return withMovement([...map.values()], legOrder);
}
