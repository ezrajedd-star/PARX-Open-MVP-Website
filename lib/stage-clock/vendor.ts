/**
 * VENDORED from the Stage Clock repo (ezrajedd-star/stage-clock), Apache-2.0.
 *   src/types.ts (Driver, Settings) · src/lib/standings.ts · src/lib/firestoreRest.ts (decoders)
 * Copied verbatim so imported totals match the Stage Clock board to the millisecond.
 * If Stage Clock's timing rules change, re-copy these functions (see STAGE_CLOCK.md).
 */
/* eslint-disable */

export interface Driver {
  id: string;
  name: string;
  carNumber: string;
  carModel?: string;
  class: string;
  stageTimes: Record<string, number>; // SS# -> seconds; -1 = DNF, -2 = DNS
  stagePenalties: Record<string, number>;
  droppedStages?: string[];
  totalTimeSeconds: number;
  isHidden?: boolean;
  updatedAt: any;
}

export interface Settings {
  dnfPenalty: number;
  dnfCalculationMethod?: "class" | "overall";
  eventName?: string;
  /** Added for the PARX Open integration: which PARX leg this event is, and when it was closed. */
  parxLegSlug?: string;
  closedAt?: string;
}

export const ALL_STAGES = Array.from({ length: 12 }, (_, i) => i + 1);

export type StageStats = Record<string, { min: number; max: number }>;

export interface ProcessedDriver extends Driver {
  effectiveTotal: number;
  effectiveStageTimes: Record<string, number>;
  isDnfEntry: Record<string, boolean>;
  isDropped: Record<string, boolean>; // run dropped by the operator: not counted in effectiveTotal
}

export const classKey = (d: Driver) => d.class.trim().toUpperCase();

export function getClasses(drivers: Driver[]): string[] {
  return Array.from(new Set(drivers.map(classKey))).sort();
}

// Only official entries count towards the fastest/slowest times (and so the DNF/DNS
// substitute time): disqualified (hidden) rows are left out.
const isOfficial = (d: Driver) => !d.isHidden;

// Per class, per stage: fastest and slowest time including penalty (valid times, official entries only).
export function computeClassStats(drivers: Driver[], classes: string[], stages: number[]) {
  const stats: Record<string, StageStats> = {};

  classes.forEach(cls => {
    stats[cls] = {};
    stages.forEach(s => {
      const stageKey = s.toString();
      const times = drivers
        .filter(d => isOfficial(d) && d.class.trim().toUpperCase() === cls && d.stageTimes[stageKey] > 0)
        .map(d => d.stageTimes[stageKey] + (d.stagePenalties[stageKey] || 0));

      if (times.length > 0) {
        stats[cls][stageKey] = {
          min: Math.min(...times),
          max: Math.max(...times)
        };
      }
    });
  });

  return stats;
}

// Per stage across all classes: fastest and slowest time including penalty (official entries only).
export function computeOverallStats(drivers: Driver[], stages: number[]) {
  const stats: StageStats = {};
  stages.forEach(s => {
    const stageKey = s.toString();
    const times = drivers
      .filter(d => isOfficial(d) && d.stageTimes[stageKey] > 0)
      .map(d => d.stageTimes[stageKey] + (d.stagePenalties[stageKey] || 0));

    if (times.length > 0) {
      stats[stageKey] = {
        min: Math.min(...times),
        max: Math.max(...times)
      };
    }
  });
  return stats;
}

// Effective stage times: valid time + penalty; DNF/DNS = slowest (class or overall) + DNF penalty.
// A dropped run keeps its effective time (still shown, still part of the stage) but is left out
// of that crew's total.
export function computeProcessedDrivers(
  drivers: Driver[],
  settings: Settings,
  classStats: Record<string, StageStats>,
  overallStats: StageStats,
  stages: number[],
): ProcessedDriver[] {
  return drivers.map(d => {
    const cls = d.class.trim().toUpperCase();
    let effectiveTotal = 0;
    const effectiveStageTimes: Record<string, number> = {};
    const isDnfEntry: Record<string, boolean> = {};
    const isDropped: Record<string, boolean> = {};
    const dropped = new Set(d.droppedStages ?? []);

    stages.forEach(s => {
      const stageKey = s.toString();
      const time = d.stageTimes[stageKey];
      const penalty = d.stagePenalties[stageKey] || 0;

      let effectiveTime = 0;
      if (time > 0) {
        effectiveTime = time + penalty;
      } else if (time < 0) {
        // DNF/DNS
        const isOverall = settings.dnfCalculationMethod === 'overall';
        const maxTime = isOverall
          ? (overallStats[stageKey]?.max || 0)
          : (classStats[cls]?.[stageKey]?.max || 0);
        effectiveTime = maxTime + settings.dnfPenalty;
        isDnfEntry[stageKey] = true;
      }

      effectiveStageTimes[stageKey] = effectiveTime;
      if (dropped.has(stageKey) && time !== undefined) {
        isDropped[stageKey] = true;
      } else if (effectiveTime > 0) {
        effectiveTotal += effectiveTime;
      }
    });

    return {
      ...d,
      effectiveTotal,
      effectiveStageTimes,
      isDnfEntry,
      isDropped
    };
  });
}

// Convenience: run the full calculation for a set of stages.
export function computeResults(drivers: Driver[], settings: Settings, stages: number[] = ALL_STAGES) {
  const classes = getClasses(drivers);
  const classStats = computeClassStats(drivers, classes, stages);
  const overallStats = computeOverallStats(drivers, stages);
  const processed = computeProcessedDrivers(drivers, settings, classStats, overallStats, stages);
  return { classes, classStats, overallStats, processed };
}

type RestValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  nullValue?: null;
  timestampValue?: string;
  mapValue?: { fields?: Record<string, RestValue> };
  arrayValue?: { values?: RestValue[] };
};

export interface RestDocument {
  name: string;
  fields?: Record<string, RestValue>;
}

export function decodeValue(v: RestValue): unknown {
  if (v.stringValue !== undefined) return v.stringValue;
  if (v.integerValue !== undefined) return Number(v.integerValue);
  if (v.doubleValue !== undefined) return v.doubleValue;
  if (v.booleanValue !== undefined) return v.booleanValue;
  if (v.timestampValue !== undefined) return v.timestampValue;
  if (v.mapValue !== undefined) return decodeFields(v.mapValue.fields ?? {});
  if (v.arrayValue !== undefined) return (v.arrayValue.values ?? []).map(decodeValue);
  return null;
}

export function decodeFields(fields: Record<string, RestValue>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) out[k] = decodeValue(v);
  return out;
}

export function decodeDriver(doc: RestDocument): Driver {
  const data = decodeFields(doc.fields ?? {});
  const id = doc.name.split('/').pop() as string;
  return {
    id,
    name: String(data.name ?? ''),
    carNumber: String(data.carNumber ?? ''),
    ...(typeof data.carModel === 'string' && data.carModel.trim() ? { carModel: data.carModel.trim() } : {}),
    class: String(data.class ?? ''),
    stageTimes: (data.stageTimes as Record<string, number>) ?? {},
    stagePenalties: (data.stagePenalties as Record<string, number>) ?? {},
    totalTimeSeconds: Number(data.totalTimeSeconds ?? 0),
    isHidden: Boolean(data.isHidden),
    ...(Array.isArray(data.droppedStages) && data.droppedStages.length ? { droppedStages: (data.droppedStages as unknown[]).map(String) } : {}),
    updatedAt: data.updatedAt ?? null,
  };
}

export function decodeSettings(doc: RestDocument | null): Settings {
  const data = doc ? decodeFields(doc.fields ?? {}) : {};
  return {
    dnfPenalty: typeof data.dnfPenalty === "number" ? data.dnfPenalty : 60,
    dnfCalculationMethod: data.dnfCalculationMethod === "overall" ? "overall" : "class",
    eventName: typeof data.eventName === "string" ? data.eventName : undefined,
    parxLegSlug: typeof data.parxLegSlug === "string" ? data.parxLegSlug : undefined,
    closedAt: typeof data.closedAt === "string" ? data.closedAt : undefined,
  };
}
