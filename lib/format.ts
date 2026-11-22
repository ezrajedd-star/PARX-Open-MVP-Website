const TZ = "Asia/Manila";

/** "Mar 12–14, 2027", "Feb 28 – Mar 2, 2027", "Dec 30, 2027 – Jan 1, 2028" or "Dates TBA". */
export function formatLegDates(dates: { start: string; end: string } | null): string {
  if (!dates) return "Dates TBA";
  const parts = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return { y, d, mon: MONTHS[m - 1] };
  };
  const s = parts(dates.start), e = parts(dates.end);
  if (dates.start === dates.end) return `${s.mon} ${s.d}, ${s.y}`;
  if (s.y !== e.y) return `${s.mon} ${s.d}, ${s.y} – ${e.mon} ${e.d}, ${e.y}`;
  if (s.mon !== e.mon) return `${s.mon} ${s.d} – ${e.mon} ${e.d}, ${e.y}`;
  return `${s.mon} ${s.d}–${e.d}, ${s.y}`;
}
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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
