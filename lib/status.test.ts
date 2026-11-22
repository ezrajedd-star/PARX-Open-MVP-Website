import { describe, expect, it } from "vitest";
import { computeStatuses, countdownParts, legStartMoment, manilaToday } from "./status";

const legs = [
  { slug: "a", round: 1, dates: { start: "2027-03-12", end: "2027-03-14" }, statusOverride: null },
  { slug: "b", round: 2, dates: { start: "2027-05-07", end: "2027-05-09" }, statusOverride: null },
  { slug: "c", round: 3, dates: null, statusOverride: null },
] as const;
const L = legs.map((l) => ({ ...l, dates: l.dates ? { ...l.dates } : null }));

describe("manilaToday", () => {
  it("uses Manila, not UTC", () => {
    // 2027-03-11 16:30 UTC is 2027-03-12 00:30 in Manila
    expect(manilaToday(new Date("2027-03-11T16:30:00Z"))).toBe("2027-03-12");
    expect(manilaToday(new Date("2027-03-11T15:59:00Z"))).toBe("2027-03-11");
  });
});

describe("computeStatuses", () => {
  it("before the season: first leg is next", () => {
    expect(computeStatuses(L, new Date("2027-01-01T00:00:00Z"))).toEqual({ a: "next", b: "upcoming", c: "upcoming" });
  });
  it("turns live at Manila midnight on the start date", () => {
    expect(computeStatuses(L, new Date("2027-03-11T15:59:00Z")).a).toBe("next");
    expect(computeStatuses(L, new Date("2027-03-11T16:00:00Z")).a).toBe("live");
  });
  it("live weekend: next leg is flagged next", () => {
    expect(computeStatuses(L, new Date("2027-03-13T04:00:00Z"))).toEqual({ a: "live", b: "next", c: "upcoming" });
  });
  it("completed after the end date (Manila)", () => {
    expect(computeStatuses(L, new Date("2027-03-14T15:59:00Z")).a).toBe("live");
    expect(computeStatuses(L, new Date("2027-03-14T16:00:00Z")).a).toBe("completed");
  });
  it("TBA legs can be next", () => {
    expect(computeStatuses(L, new Date("2027-06-01T00:00:00Z"))).toEqual({ a: "completed", b: "completed", c: "next" });
  });
  it("override wins", () => {
    const o = L.map((l) => (l.slug === "a" ? { ...l, statusOverride: "completed" as const } : l));
    expect(computeStatuses(o, new Date("2027-01-01T00:00:00Z"))).toEqual({ a: "completed", b: "next", c: "upcoming" });
  });
});

describe("countdown", () => {
  it("counts down to Manila midnight", () => {
    const t = legStartMoment({ start: "2027-03-12" })!;
    expect(t.toISOString()).toBe("2027-03-11T16:00:00.000Z");
    expect(countdownParts(t, new Date("2027-03-10T14:59:00Z"))).toEqual({ days: 1, hours: 1, minutes: 1, done: false });
  });
});
