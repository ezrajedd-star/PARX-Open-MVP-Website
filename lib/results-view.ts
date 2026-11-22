/** Turns a leg classification into serialisable rows for the client table. Server-only. */
import type { ClassRow } from "@/components/results/ClassificationTable";
import { driverMap, getLegClassification, teamMap } from "./data";
import { formatGap, formatTime } from "./standings";

export function classRowsForLeg(legSlug: string): { sample: boolean; rows: ClassRow[] } | null {
  const c = getLegClassification(legSlug);
  if (!c) return null;
  const dm = driverMap();
  const tm = teamMap();
  return {
    sample: c.sample,
    rows: c.rows.map((r) => {
      const d = dm.get(r.driverSlug)!;
      const t = tm.get(d.teamSlug)!;
      return {
        driverSlug: r.driverSlug,
        driverName: d.displayName,
        teamName: t.independent ? "Independent" : t.name,
        teamColor: t.colors.primary,
        position: r.position,
        status: r.status,
        total: r.status === "FIN" ? formatTime(r.totalMs) : r.status,
        gap: r.status === "FIN" ? formatGap(r.gapMs) : "—",
        points: r.points,
        stages: r.stageMs.map((s) => formatTime(s)),
        stageBest: r.stageBest,
        stageFlags: r.stageFlags,
        className: r.class,
        classPosition: r.classPosition,
        carNumber: r.carNumber,
      };
    }),
  };
}
