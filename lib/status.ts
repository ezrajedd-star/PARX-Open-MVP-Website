/**
 * Leg status — pure functions shared by server (build) and client (live re-check).
 * All "today" logic runs in Asia/Manila time regardless of the visitor's timezone.
 */
import type { LegStatus } from "./types";

export const MANILA_TZ = "Asia/Manila";
export const MANILA_OFFSET = "+08:00"; // The Philippines has no daylight saving time.

export interface StatusInput {
  slug: string;
  round: number;
  dates: { start: string; end: string } | null;
  statusOverride: LegStatus | null;
}

/** Today's calendar date in Manila as YYYY-MM-DD. */
export function manilaToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: MANILA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Moment the leg starts (00:00 Manila on the start date). */
export function legStartMoment(dates: { start: string } | null): Date | null {
  return dates ? new Date(`${dates.start}T00:00:00${MANILA_OFFSET}`) : null;
}

function dateStatus(l: StatusInput, today: string): "completed" | "live" | "pending" {
  if (l.statusOverride === "completed") return "completed";
  if (l.statusOverride === "live") return "live";
  if (l.statusOverride === "upcoming" || l.statusOverride === "next") return "pending";
  if (!l.dates) return "pending";
  if (today > l.dates.end) return "completed";
  if (today >= l.dates.start) return "live";
  return "pending";
}

/**
 * Status for every leg.
 * - Completed: after the end date (Manila)
 * - Live: on or between start and end dates
 * - Next: the first not-yet-run leg in round order (also when its dates are TBA)
 * - Upcoming: everything else
 * A manual statusOverride always wins.
 */
export function computeStatuses(legs: StatusInput[], now: Date = new Date()): Record<string, LegStatus> {
  const today = manilaToday(now);
  const sorted = [...legs].sort((a, b) => a.round - b.round);
  const out: Record<string, LegStatus> = {};
  const forcedNext = sorted.find((l) => l.statusOverride === "next");
  let nextAssigned = !!forcedNext;
  for (const l of sorted) {
    const s = dateStatus(l, today);
    if (s !== "pending") out[l.slug] = s;
    else if (forcedNext) out[l.slug] = l === forcedNext ? "next" : "upcoming";
    else if (!nextAssigned) {
      out[l.slug] = "next";
      nextAssigned = true;
    } else out[l.slug] = "upcoming";
  }
  return out;
}

export function liveLeg<T extends StatusInput>(legs: T[], now?: Date): T | undefined {
  const st = computeStatuses(legs, now);
  return [...legs].sort((a, b) => a.round - b.round).find((l) => st[l.slug] === "live");
}
export function nextLeg<T extends StatusInput>(legs: T[], now?: Date): T | undefined {
  const st = computeStatuses(legs, now);
  return legs.find((l) => st[l.slug] === "next");
}

export function countdownParts(target: Date, now: Date = new Date()) {
  const ms = Math.max(0, target.getTime() - now.getTime());
  const totalMin = Math.floor(ms / 60000);
  return { days: Math.floor(totalMin / 1440), hours: Math.floor((totalMin % 1440) / 60), minutes: totalMin % 60, done: ms === 0 };
}

export const STATUS_LABEL: Record<LegStatus, string> = {
  upcoming: "Upcoming",
  next: "Next",
  live: "Live",
  completed: "Completed",
};
