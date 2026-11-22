import { describe, expect, it } from "vitest";
import { mapStageClock, StageClockImportError } from "./map";
import type { Driver, Settings } from "./vendor";

const settings: Settings = { dnfPenalty: 10, dnfCalculationMethod: "class", eventName: "Test Rally", parxLegSlug: "ormoc", closedAt: "2027-03-14T10:00:00Z" };
const roster = [
  { slug: "jong", displayName: "Jong", number: null, car: null },
  { slug: "ian-a", displayName: "Ian A.", number: null, car: null },
  { slug: "vip", displayName: "Vip", number: null, car: "Existing car" },
  { slug: "toto", displayName: "Toto", number: 7, car: null },
];
let n = 0;
const drv = (name: string, carNumber: string, cls: string, times: number[], extra: Partial<Driver> = {}): Driver => ({
  id: `d${n++}`,
  name,
  carNumber,
  class: cls,
  stageTimes: Object.fromEntries(times.map((t, i) => [String(i + 1), t]).filter(([, t]) => t !== undefined && !Number.isNaN(t))),
  stagePenalties: {},
  totalTimeSeconds: 0,
  updatedAt: null,
  ...extra,
});
const config = { aliases: { "C. VIP": "vip" }, ignore: ["GG test"] };

describe("mapStageClock", () => {
  const drivers = [
    drv("JONG", "41", "AWD", [60, 61, 62]),
    drv("Ian A.", "24", "GROUP 2", [62, 63, 64], { carModel: "Corolla" }),
    drv("C. VIP", "22", "GROUP 2", [61, -1, 63]), // alias + DNF on SS2
    drv("Lance", "40", "AWD", [65, 66, 67], { droppedStages: ["3"] }), // new driver, dropped run
    drv("Ezra test", "67", "AWD", [1, 1, 1], { isHidden: true }),
    drv("GG test", "68", "AWD", [2, 2, 2]),
    drv("Mye", "52", "LADIES", [NaN, NaN, 70]), // incomplete
    drv("Ghost", "99", "AWD", [-2, -2, -2]),
  ];
  const r = mapStageClock({ drivers, settings, legSlug: "ormoc", roster, config, now: new Date("2027-03-14T12:00:00Z") });
  const e = Object.fromEntries(r.file.entries.map((x) => [x.driverSlug, x]));

  it("skips hidden and ignored rows", () => {
    expect(r.skipped.map((s) => s.name).sort()).toEqual(["Ezra test", "GG test"]);
  });
  it("matches by alias, name (case-insensitive) and adds new drivers", () => {
    expect(e.vip.carNumber).toBe("22");
    expect(e.jong.status).toBe("FIN");
    expect(r.newDrivers.map((d) => d.slug).sort()).toEqual(["ghost", "lance", "mye"]);
  });
  it("uses Stage Clock effective times: DNF = slowest in class + penalty", () => {
    // GROUP 2 SS2: slowest valid = 63 → DNF = 73
    expect(e.vip.stageTimes[1]).toBe("1:13.000");
    expect(e.vip.stageFlags?.[1]).toBe("DNF");
    expect(e.vip.totalTime).toBe("3:17.000");
  });
  it("does not count dropped runs in the total", () => {
    expect(e.lance.stageFlags?.[2]).toBe("DROPPED");
    expect(e.lance.totalTime).toBe("2:11.000");
  });
  it("ranks overall and within class", () => {
    // Stage Clock leaves a dropped run out of the total, exactly like its board.
    expect(e.lance).toMatchObject({ position: 1, classPosition: 1 }); // 131 s (SS3 dropped)
    expect(e.jong).toMatchObject({ position: 2, classPosition: 2 }); // 183 s
    expect(e["ian-a"]).toMatchObject({ position: 3, classPosition: 1 });
    expect(e.vip).toMatchObject({ position: 4, classPosition: 2 });
  });
  it("incomplete entries become unclassified DNF with a warning; all-DNS is DNS", () => {
    expect(e.mye).toMatchObject({ status: "DNF", position: null });
    expect(r.warnings.join(" ")).toMatch(/Mye #52/);
    expect(e.ghost).toMatchObject({ status: "DNS", position: null, totalTime: undefined });
  });
  it("fills empty profile fields only", () => {
    expect(r.profileUpdates).toContainEqual({ slug: "ian-a", field: "car", value: "Corolla" });
    expect(r.profileUpdates).toContainEqual({ slug: "jong", field: "number", value: 41 });
    expect(r.profileUpdates.some((u) => u.slug === "vip" && u.field === "car")).toBe(false);
  });
  it("records the source", () => {
    expect(r.file.source).toMatchObject({ system: "stage-clock", eventName: "Test Rally", closedAt: "2027-03-14T10:00:00Z", dnfPenaltySeconds: 10 });
  });
  it("refuses two visible entries for one driver", () => {
    expect(() => mapStageClock({ drivers: [drv("Jong", "41", "AWD", [60]), drv("jong", "1", "GROUP 1", [61])], settings, legSlug: "ormoc", roster, config })).toThrow(StageClockImportError);
  });
  it("refuses an empty event", () => {
    expect(() => mapStageClock({ drivers: [drv("X", "1", "A", [1], { isHidden: true })], settings, legSlug: "ormoc", roster, config })).toThrow(/no visible entries/);
  });
});
