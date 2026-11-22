"use client";
import { STATUS_LABEL } from "@/lib/status";
import type { LegStatus } from "@/lib/types";
import { useLegStatus } from "../layout/LegStatusProvider";

const STYLE: Record<LegStatus, string> = {
  live: "bg-red text-white",
  next: "bg-gold text-navy",
  upcoming: "bg-white/90 text-navy ring-1 ring-navy/15",
  completed: "bg-navy text-white ring-1 ring-white/20",
};

export function LegStatusBadge({ slug, initial, className = "" }: { slug: string; initial: LegStatus; className?: string }) {
  const s = useLegStatus(slug, initial);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 font-display text-xs font-extrabold uppercase italic tracking-wider ${STYLE[s]} ${className}`}>
      {s === "live" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden />}
      {STATUS_LABEL[s]}
    </span>
  );
}

/** Renders children only when the (client re-checked) status matches. */
export function ShowWhenStatus({ slug, initial, is, children }: { slug: string; initial: LegStatus; is: LegStatus[]; children: React.ReactNode }) {
  const s = useLegStatus(slug, initial);
  return is.includes(s) ? <>{children}</> : null;
}
