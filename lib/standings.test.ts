import { describe, expect, it } from "vitest";
import { classify, driverStandings, formatTime, parseTime, teamStandings } from "./standings";
import type { PointsTable, ResultsFile } from "./types";

const table: PointsTable = { positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1], statusPoints: { DNF: 0, DNS: 0, DSQ: 0 }, teamScoringDrivers: 2 };
const st = (s: string) => Array(8).fill(s);
const r1: ResultsFile = {
  legSlug: "a",
  sample: false,
  entries: [
    { driverSlug: "x", position: 1, status: "FIN", stageTimes: st("1:00.000") },
    { driverSlug: "y", position: 2, status: "FIN", stageTimes: st("1:00.500") },
    { driverSlug: "z", position: 3, status: "FIN", stageTimes: st("1:01.000") },
    { driverSlug: "w", position: null, status: "DNF", stageTimes: [...st("1:00.000").slice(0, 3), null, null, null, null, null] },
  ],
};
const r2: ResultsFile = {
  legSlug: "b",
  sample: false,
  entries: [
    { driverSlug: "z", position: 1, status: "FIN", stageTimes: st("1:00.000") },
    { driverSlug: "y", position: 2, status: "FIN", stageTimes: st("1:00.100") },
    { driverSlug: "x", position: null, status: "DSQ", stageTimes: st("0:59.000") },
  ],
};

describe("time", () => {
  it("parses and formats", () => {
    expect(parseTime("1:02.345")).toBe(62345);
    expect(formatTime(62345)).toBe("1:02.345");
    expect(formatTime(3723456)).toBe("1:02:03.456");
  });
});

describe("classify", () => {
  it("computes totals, gaps and points", () => {
    const c = classify(r1, table);
    expect(c.map((r) => r.points)).toEqual([25, 18, 15, 0]);
    expect(c[0].totalMs).toBe(480000);
    expect(c[1].gapMs).toBe(4000);
    expect(c[3].totalMs).toBeNull();
  });
});

describe("standings", () => {
  it("sums points across legs with movement", () => {
    const s = driverStandings([r1, r2], ["a", "b", "c"], table);
    expect(s.map((r) => [r.id, r.total])).toEqual([["y", 36], ["z", 40], ["x", 25], ["w", 0]].sort((a, b) => (b[1] as number) - (a[1] as number)));
    const z = s.find((r) => r.id === "z")!;
    expect(z.position).toBe(1);
    expect(z.movement).toBe(2); // P3 → P1
    expect(z.perLeg.c).toBeNull();
  });
  it("single round has no movement", () => {
    expect(driverStandings([r1], ["a", "b"], table)[0].movement).toBeNull();
  });
  it("team counts best N drivers", () => {
    const t = teamStandings([r1], ["a"], table, { x: "t1", y: "t1", z: "t1", w: "t2" });
    expect(t[0]).toMatchObject({ id: "t1", total: 43 });
    expect(t[1]).toMatchObject({ id: "t2", total: 0 });
  });
});
