const TZ = "Asia/Manila";

/** "12–14 Mar 2027", "28 Feb – 2 Mar 2027", or "Dates TBA". */
export function formatLegDates(dates: { start: string; end: string } | null): string {
  if (!dates) return "Dates TBA";
  const s = new Date(`${dates.start}T12:00:00+08:00`);
  const e = new Date(`${dates.end}T12:00:00+08:00`);
  const d = (x: Date, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-PH", { timeZone: TZ, ...o }).format(x);
  const sameMonth = d(s, { month: "short", year: "numeric" }) === d(e, { month: "short", year: "numeric" });
  if (dates.start === dates.end) return d(s, { day: "numeric", month: "short", year: "numeric" });
  if (sameMonth) return `${d(s, { day: "numeric" })}–${d(e, { day: "numeric", month: "short", year: "numeric" })}`;
  return `${d(s, { day: "numeric", month: "short" })} – ${d(e, { day: "numeric", month: "short", year: "numeric" })}`;
}

export function formatDate(iso: string, style: "long" | "short" = "long"): string {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: TZ,
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
  }).format(new Date(`${iso}T12:00:00+08:00`));
}

export function formatPeso(n: number | null, fallback = "Price TBA"): string {
  if (n == null) return fallback;
  return `₱${n.toLocaleString("en-PH")}`;
}

export const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const tba = (v: string | number | null | undefined, label = "TBA") => (v == null || v === "" ? label : String(v));
