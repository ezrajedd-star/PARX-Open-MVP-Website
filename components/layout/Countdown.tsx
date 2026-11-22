"use client";
import { countdownParts, legStartMoment } from "@/lib/status";
import { useLegs } from "./LegStatusProvider";

/** Days / hours / minutes to a leg's start (00:00 Manila). Renders fixed-size placeholders until mounted to avoid layout shift. */
export function Countdown({ start, size = "sm", tone = "dark" }: { start: string; size?: "sm" | "lg"; tone?: "dark" | "light" }) {
  const { now } = useLegs();
  const target = legStartMoment({ start })!;
  const p = now ? countdownParts(target, now) : null;
  const units: [string, number | undefined][] = [
    ["Days", p?.days],
    ["Hrs", p?.hours],
    ["Min", p?.minutes],
  ];
  const lg = size === "lg";
  return (
    <div className="flex items-stretch gap-1.5" role="timer" aria-live="off" aria-label={p ? `${p.days} days, ${p.hours} hours, ${p.minutes} minutes to go` : "Countdown"}>
      {units.map(([label, v]) => (
        <div
          key={label}
          className={`flex flex-col items-center justify-center ${lg ? "min-w-16 px-2 py-2 md:min-w-20" : "min-w-10 px-1.5 py-0.5"} ${tone === "dark" ? "bg-white/10" : "bg-navy text-white"}`}
        >
          <span className={`font-display font-extrabold italic tabular leading-none ${lg ? "text-4xl md:text-5xl" : "text-lg"}`}>
            {v == null ? "--" : String(v).padStart(2, "0")}
          </span>
          <span className={`font-display font-semibold uppercase tracking-widest opacity-75 ${lg ? "mt-1 text-xs" : "text-[9px]"}`}>{label}</span>
        </div>
      ))}
    </div>
  );
}
