import Link from "next/link";
import type { LegWithStatus } from "@/lib/data";
import { formatLegDates } from "@/lib/format";
import { Photo } from "../ui/Photo";
import { buttonClass } from "../ui/Button";
import { CalendarIcon, PinIcon } from "../ui/Icons";
import { SampleBadge } from "../ui/Section";
import { LegStatusBadge } from "./LegStatusBadge";

/** Full calendar card (Calendar index). */
export function LegCard({ leg, priority = false }: { leg: LegWithStatus; priority?: boolean }) {
  return (
    <article className="group flex flex-col overflow-hidden bg-white shadow-[0_1px_0_rgb(11_31_75/.08),0_8px_24px_-12px_rgb(11_31_75/.25)] ring-1 ring-navy/10">
      <div className="relative">
        <Photo src={leg.heroImage} alt={`${leg.name} rallycross venue`} kind="hero" className="aspect-[16/9]" sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw" priority={priority} showLabel={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/20 to-transparent" aria-hidden />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <LegStatusBadge slug={leg.slug} initial={leg.status} />
          <span className="bg-navy-deep/80 px-2 py-0.5 font-display text-xs font-bold uppercase tracking-wider text-white">{leg.islandGroup}</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex items-end gap-3 p-4 text-white">
          <span className="heading text-6xl leading-[0.8] text-gold tabular" aria-hidden>
            {String(leg.round).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <p className="eyebrow text-white/75">Round {leg.round}</p>
            <h3 className="heading truncate text-4xl">{leg.name}</h3>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <dl className="space-y-1.5 text-sm text-ink/80">
          <div className="flex items-center gap-2">
            <dt className="sr-only">Location</dt>
            <PinIcon width={16} height={16} className="text-red" />
            <dd>
              {leg.province} · {leg.islandGroup}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="sr-only">Dates</dt>
            <CalendarIcon width={16} height={16} className="text-red" />
            <dd className={leg.dates ? "font-semibold text-navy" : "font-semibold text-navy/70"}>{formatLegDates(leg.dates)}</dd>
          </div>
        </dl>
        {leg.hasResults && leg.sampleResults && <SampleBadge label="Sample results" className="self-start" />}
        <div className="mt-auto flex gap-2 pt-1">
          <Link href={`/calendar/${leg.slug}`} className={`${buttonClass("dark", "sm")} flex-1`}>
            Event details<span className="sr-only">: {leg.name}</span>
          </Link>
          {leg.hasResults && (
            <Link href={`/results/${leg.slug}`} className={`${buttonClass("ghost-dark", "sm")} flex-1`}>
              Results<span className="sr-only">: {leg.name}</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

/** Compact card for the horizontal season strip on Home. */
export function LegStripCard({ leg }: { leg: LegWithStatus }) {
  return (
    <Link
      href={`/calendar/${leg.slug}`}
      className="group relative flex h-full w-[240px] shrink-0 snap-start flex-col justify-between overflow-hidden bg-navy p-4 text-white ring-1 ring-white/10 transition hover:ring-gold md:w-full md:shrink"
    >
      <div className="speed-lines absolute inset-0 opacity-60" aria-hidden />
      <div className="relative flex items-start justify-between">
        <span className="heading text-5xl text-gold tabular">{String(leg.round).padStart(2, "0")}</span>
        <LegStatusBadge slug={leg.slug} initial={leg.status} />
      </div>
      <div className="relative mt-8">
        <p className="eyebrow text-white/60">{leg.islandGroup}</p>
        <h3 className="heading mt-1 text-3xl">{leg.name}</h3>
        <p className="text-sm text-white/75">{leg.province}</p>
        <p className="mt-3 border-t border-white/15 pt-3 font-display text-sm font-bold uppercase tracking-wide">{formatLegDates(leg.dates)}</p>
      </div>
    </Link>
  );
}
