/** Higher-level, page-ready data built from /content. Server-only. */
import { getDrivers, getLegs, getPoints, getResultsFiles, getTeams } from "./content";
import { classify, driverStandings, teamStandings } from "./standings";
import { computeStatuses } from "./status";
import type { Leg, LegStatus } from "./types";

export type LegWithStatus = Leg & { status: LegStatus; hasResults: boolean; sampleResults: boolean };

export function getLegsWithStatus(now = new Date()): LegWithStatus[] {
  const legs = getLegs();
  const st = computeStatuses(legs, now);
  const files = getResultsFiles();
  return legs.map((l) => {
    const r = files.find((f) => f.legSlug === l.slug);
    return { ...l, status: st[l.slug], hasResults: !!r && r.entries.length > 0, sampleResults: !!r?.sample };
  });
}

export function getChampionship() {
  const legs = getLegs();
  const order = legs.map((l) => l.slug);
  const files = getResultsFiles();
  const points = getPoints();
  const drivers = getDrivers();
  const driverTeam = Object.fromEntries(drivers.map((d) => [d.slug, d.independent ? null : d.teamSlug]));
  return {
    legs,
    drivers: driverStandings(files, order, points),
    teams: teamStandings(files, order, points, driverTeam),
    hasSample: files.some((f) => f.sample),
    hasAnyResults: files.some((f) => f.entries.length > 0),
  };
}

export function getLegClassification(legSlug: string) {
  const file = getResultsFiles().find((f) => f.legSlug === legSlug);
  if (!file) return null;
  return { sample: file.sample, rows: classify(file, getPoints()) };
}

export const driverMap = () => new Map(getDrivers().map((d) => [d.slug, d]));
export const teamMap = () => new Map(getTeams().map((t) => [t.slug, t]));
