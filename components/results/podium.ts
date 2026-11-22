/** Gold / silver / bronze accents for P1–P3. */
export function podiumClass(pos: number | null, tone: "dark" | "light" = "light") {
  if (pos === 1) return "bg-gold text-navy";
  if (pos === 2) return "bg-silver text-navy";
  if (pos === 3) return "bg-bronze text-navy";
  return tone === "dark" ? "bg-white/10 text-white" : "bg-navy/5 text-navy";
}
export function podiumBorder(pos: number | null) {
  if (pos === 1) return "var(--parx-gold)";
  if (pos === 2) return "var(--parx-silver)";
  if (pos === 3) return "var(--parx-bronze)";
  return "transparent";
}
