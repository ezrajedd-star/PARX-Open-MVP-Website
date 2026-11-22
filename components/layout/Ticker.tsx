"use client";
import Link from "next/link";
import { formatLegDates } from "@/lib/format";
import { ArrowRight } from "../ui/Icons";
import { Countdown } from "./Countdown";
import { useLegs } from "./LegStatusProvider";

/** "Next race" bar under the header. Switches to a red LIVE state during a race weekend. */
export function Ticker({ liveTiming }: { liveTiming: { url: string; label: string } }) {
  const { legs, statuses } = useLegs();
  const live = legs.find((l) => statuses[l.slug] === "live");
  const next = legs.find((l) => statuses[l.slug] === "next");

  if (live)
    return (
      <div className="bg-red text-white">
        <div className="container-x flex min-h-11 items-center gap-3">
          <span className="flex shrink-0 items-center gap-1.5 bg-white px-2 py-0.5 font-display text-sm font-extrabold italic tracking-wider text-red">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red" aria-hidden />
            LIVE
          </span>
          <Link href={`/calendar/${live.slug}`} className="min-w-0 truncate font-display text-base font-bold uppercase italic tracking-wide hover:underline">
            R{live.round} · {live.name}
            <span className="hidden sm:inline">, {live.province}</span>
          </Link>
          <a href={liveTiming.url} target="_blank" rel="noopener" className="ml-auto flex shrink-0 items-center gap-1 bg-white/15 px-2.5 py-1 font-display text-sm font-extrabold uppercase italic tracking-wide hover:bg-white hover:text-red">
            {liveTiming.label} <ArrowRight width={16} height={16} />
          </a>
        </div>
      </div>
    );

  if (!next) return null;
  return (
    <Link href={`/calendar/${next.slug}`} className="group block border-b border-white/10 bg-navy-deep text-white hover:bg-navy" aria-label={`Next race: Round ${next.round}, ${next.name} — ${formatLegDates(next.dates)}`}>
      <div className="container-x flex min-h-11 items-center gap-3 py-1.5">
        <span className="shrink-0 bg-gold px-2 py-0.5 font-display text-xs font-extrabold uppercase italic tracking-wider text-navy">Next race</span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate font-display text-[15px] font-bold uppercase italic tracking-wide">
            R{next.round} · {next.name}
            <span className="hidden font-semibold text-white/70 sm:inline">, {next.province}</span>
          </span>
          <span className="block text-xs text-white/70">{formatLegDates(next.dates)}</span>
        </span>
        {next.dates ? (
          <Countdown start={next.dates.start} />
        ) : (
          <span className="hidden shrink-0 font-display text-sm font-bold uppercase italic text-gold sm:block">Countdown starts when dates are confirmed</span>
        )}
        <ArrowRight width={18} height={18} className="shrink-0 opacity-70 transition group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden />
      </div>
    </Link>
  );
}
