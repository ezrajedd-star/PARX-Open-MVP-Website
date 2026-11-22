import { describe, expect, it } from "vitest";
import { formatLegDates, formatPeso } from "./format";

describe("formatLegDates", () => {
  it("formats ranges", () => {
    expect(formatLegDates(null)).toBe("Dates TBA");
    expect(formatLegDates({ start: "2027-03-12", end: "2027-03-14" })).toBe("Mar 12–14, 2027");
    expect(formatLegDates({ start: "2027-02-28", end: "2027-03-02" })).toBe("Feb 28 – Mar 2, 2027");
    expect(formatLegDates({ start: "2027-12-31", end: "2028-01-02" })).toBe("Dec 31, 2027 – Jan 2, 2028");
  });
  it("formats pesos", () => {
    expect(formatPeso(100000)).toBe("₱100,000");
    expect(formatPeso(null)).toBe("Price TBA");
  });
});
