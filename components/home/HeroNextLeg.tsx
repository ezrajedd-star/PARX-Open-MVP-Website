"use client";
import Link from "next/link";
import { formatLegDates } from "@/lib/format";
import { Countdown } from "../layout/Countdown";
import { useLegs } from "../layout/LegStatusProvider";
import { ArrowRight } from "../ui/Icons";

export function HeroNextLeg() {
  const { legs, statuses } = useLegs();
  const live = legs.find((l) => statuses[l.slug] === "live");
  const leg = live ?? legs.find((l) => statuses[l.slug] === "next");
  if (!leg) return null;
  return (
    <Link
      href={`/calendar/${leg.slug}`}
      className="group block max-w-md border-l-4 border-gold bg-navy-deep/70 p-4 backdrop-blur-sm transition hover:bg-navy-deep/90 md:p-5"
    >
      <p className={`eyebrow ${live ? "text-red" : "text-gold"}`}>{live ? "● Live now" : "Next leg"}</p>
      <p className="mt-1 flex items-baseline gap-2">
        <span className="heading text-3xl text-white md:text-4xl">
          R{leg.round} · {leg.name}
        </span>
        <ArrowRight width={20} height={20} className="text-white/70 transition group-hover:translate-x-1" aria-hidden />
      </p>
      <p className="text-sm text-white/75">
        {leg.province} · {formatLegDates(leg.dates)}
      </p>
      {leg.dates && !live && (
        <div className="mt-3">
          <Countdown start={leg.dates.start} size="lg" />
        </div>
      )}
      {!leg.dates && <p className="mt-3 font-display text-sm font-bold uppercase tracking-wide text-gold">Countdown starts when dates are announced</p>}
    </Link>
  );
}
