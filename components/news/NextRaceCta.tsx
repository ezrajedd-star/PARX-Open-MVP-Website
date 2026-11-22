"use client";
import Link from "next/link";
import { formatLegDates } from "@/lib/format";
import { Countdown } from "../layout/Countdown";
import { useLegs } from "../layout/LegStatusProvider";
import { buttonClass } from "../ui/Button";

export function NextRaceCta() {
  const { legs, statuses } = useLegs();
  const leg = legs.find((l) => statuses[l.slug] === "live") ?? legs.find((l) => statuses[l.slug] === "next");
  if (!leg) return null;
  const live = statuses[leg.slug] === "live";
  return (
    <aside aria-label="Next race" className="dust-texture relative overflow-hidden bg-navy p-6 text-white md:p-8">
      <div className="speed-lines absolute inset-0" aria-hidden />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className={`eyebrow ${live ? "text-red" : "text-gold"}`}>{live ? "● Live now" : "Next race"}</p>
          <p className="heading mt-1 text-4xl md:text-5xl">
            Round {leg.round} · {leg.name}
          </p>
          <p className="text-white/75">
            {leg.province} · {formatLegDates(leg.dates)}
          </p>
          {leg.dates && !live && (
            <div className="mt-3">
              <Countdown start={leg.dates.start} />
            </div>
          )}
        </div>
        <Link href={`/calendar/${leg.slug}`} className={buttonClass("red", "lg")}>
          {live ? "Follow live" : "Event details"}
        </Link>
      </div>
    </aside>
  );
}
