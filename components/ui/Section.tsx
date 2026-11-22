import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "./Icons";

export function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel = "View all",
  tone = "light",
  as: As = "h2",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  href?: string;
  linkLabel?: string;
  tone?: "light" | "dark";
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className={`mb-6 flex items-end justify-between gap-4 md:mb-8 ${className}`}>
      <div>
        {eyebrow && (
          <p className={`eyebrow mb-2 flex items-center gap-2 ${dark ? "text-gold" : "text-red"}`}>
            <span className="inline-block h-1 w-6 -skew-x-[24deg] bg-current" aria-hidden />
            {eyebrow}
          </p>
        )}
        <As className={`heading text-[2.25rem] md:text-5xl ${dark ? "text-white" : "text-navy"}`}>{title}</As>
      </div>
      {href && (
        <Link
          href={href}
          className={`group hidden shrink-0 items-center gap-1.5 font-display text-base font-bold uppercase italic tracking-wide sm:inline-flex ${dark ? "text-white hover:text-gold" : "text-navy hover:text-red"}`}
        >
          {linkLabel}
          <ArrowRight width={18} height={18} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export function MobileViewAll({ href, label = "View all", tone = "light" }: { href: string; label?: string; tone?: "light" | "dark" }) {
  return (
    <Link
      href={href}
      className={`mt-6 flex h-12 items-center justify-center gap-2 border-2 font-display font-bold uppercase italic tracking-wide sm:hidden ${tone === "dark" ? "border-white/30 text-white" : "border-navy/20 text-navy"}`}
    >
      {label} <ArrowRight width={18} height={18} />
    </Link>
  );
}

export function SampleBadge({ label = "Sample data", className = "" }: { label?: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm border border-dashed border-current bg-gold/15 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-[#7a5400] ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
}

export function PageHero({ eyebrow, title, children, compact = false }: { eyebrow?: string; title: ReactNode; children?: ReactNode; compact?: boolean }) {
  return (
    <section className={`dust-texture relative overflow-hidden bg-navy text-white ${compact ? "py-10 md:py-14" : "py-12 md:py-20"}`}>
      <div className="speed-lines absolute inset-0" aria-hidden />
      <div className="absolute -right-24 top-0 h-full w-2/3 -skew-x-[24deg] bg-gradient-to-l from-red/25 to-transparent" aria-hidden />
      <div className="container-x relative">
        {eyebrow && <p className="eyebrow mb-3 text-gold">{eyebrow}</p>}
        <h1 className="heading text-5xl sm:text-6xl md:text-7xl">{title}</h1>
        {children && <div className="mt-4 max-w-2xl text-base text-white/80 md:text-lg">{children}</div>}
        <div className="livery mt-8 w-48 md:w-72" aria-hidden />
      </div>
    </section>
  );
}
