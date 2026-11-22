/**
 * Tier-aware sponsor display. Higher tiers = bigger tiles, higher position.
 * Used in the footer (every page), Home, each leg page and the Sponsorship page.
 */
import Image from "next/image";
import Link from "next/link";
import { getSponsorsByTier, publicFileExists } from "@/lib/content";
import type { Sponsor, SponsorTier } from "@/lib/types";

const TILE: Record<SponsorTier, { grid: string; h: string; text: string }> = {
  title: { grid: "grid-cols-1", h: "h-24 md:h-32", text: "text-2xl md:text-3xl" },
  gold: { grid: "grid-cols-2", h: "h-20 md:h-24", text: "text-lg md:text-xl" },
  silver: { grid: "grid-cols-3", h: "h-16 md:h-20", text: "text-sm md:text-base" },
  bronze: { grid: "grid-cols-3 sm:grid-cols-4", h: "h-14 md:h-16", text: "text-xs md:text-sm" },
  local: { grid: "grid-cols-3 sm:grid-cols-4 md:grid-cols-6", h: "h-12 md:h-14", text: "text-[11px] md:text-xs" },
};
const TIER_ACCENT: Record<SponsorTier, string> = {
  title: "var(--parx-gold)",
  gold: "var(--parx-gold)",
  silver: "var(--parx-silver)",
  bronze: "var(--parx-bronze)",
  local: "var(--parx-dust-dark)",
};

export function SponsorTile({ s, tone = "dark", className = "" }: { s: Sponsor; tone?: "dark" | "light"; className?: string }) {
  const t = TILE[s.tier];
  const dark = tone === "dark";
  const content =
    s.logo && publicFileExists(s.logo) ? (
      <Image src={s.logo} alt={s.name} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-contain p-3" />
    ) : (
      <span className="flex flex-col items-center px-2 text-center leading-tight">
        <span className={`font-display font-extrabold uppercase italic ${t.text}`}>{s.name.replace(/^Sample /, "")}</span>
        {s.sample && <span className="mt-1 text-[9px] font-bold tracking-[0.2em] opacity-70 md:text-[10px]">SAMPLE LOGO</span>}
      </span>
    );
  const cls = `relative flex items-center justify-center overflow-hidden ${t.h} ${
    dark ? "bg-white/[.06] text-white/85 ring-1 ring-white/10" : "bg-white text-navy ring-1 ring-navy/10"
  } ${s.sample ? "border border-dashed " + (dark ? "border-white/25" : "border-navy/25") : ""} ${className}`;
  const accent = <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: TIER_ACCENT[s.tier] }} aria-hidden />;
  if (s.url)
    return (
      <a href={s.url} target="_blank" rel="noopener sponsored" className={`${cls} transition hover:ring-gold`} aria-label={`${s.name} (opens in new tab)`}>
        {accent}
        {content}
      </a>
    );
  return (
    <div className={cls}>
      {accent}
      {content}
    </div>
  );
}

export function SponsorWall({
  legSlug,
  tiers,
  tone = "dark",
  showTierLabels = true,
  cta = true,
}: {
  legSlug?: string;
  tiers?: SponsorTier[];
  tone?: "dark" | "light";
  showTierLabels?: boolean;
  cta?: boolean;
}) {
  const groups = getSponsorsByTier({ legSlug, tiers });
  const dark = tone === "dark";
  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g.tier}>
          {showTierLabels && (
            <p className={`eyebrow mb-3 flex items-center gap-2 ${dark ? "text-white/60" : "text-navy/60"}`}>
              <span className="inline-block h-2 w-2 -skew-x-12" style={{ background: TIER_ACCENT[g.tier] }} aria-hidden />
              {g.label}
            </p>
          )}
          <ul className={`grid gap-2 md:gap-3 ${TILE[g.tier].grid}`}>
            {g.sponsors.map((s) => (
              <li key={s.name}>
                <SponsorTile s={s} tone={tone} />
              </li>
            ))}
          </ul>
        </div>
      ))}
      {groups.length === 0 && <p className={dark ? "text-white/70" : "text-navy/70"}>Partner slots are open for this leg.</p>}
      {cta && (
        <p className={`text-sm ${dark ? "text-white/70" : "text-navy/70"}`}>
          Your brand here?{" "}
          <Link href="/sponsorship" className={`font-semibold underline underline-offset-2 ${dark ? "text-gold" : "text-red"}`}>
            See sponsorship packages
          </Link>
        </p>
      )}
    </div>
  );
}
