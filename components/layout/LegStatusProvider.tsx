"use client";
/**
 * Re-checks leg statuses in the browser (Asia/Manila time) so a statically
 * generated page never shows a stale "Next"/"Live" state. Initial render uses
 * the build-time statuses to keep hydration stable.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { computeStatuses, type StatusInput } from "@/lib/status";
import type { LegStatus } from "@/lib/types";

export interface ClientLeg extends StatusInput {
  name: string;
  province: string;
}
interface Ctx {
  legs: ClientLeg[];
  statuses: Record<string, LegStatus>;
  now: Date | null; // null until mounted
}
const LegCtx = createContext<Ctx | null>(null);

export function LegStatusProvider({ legs, initial, children }: { legs: ClientLeg[]; initial: Record<string, LegStatus>; children: ReactNode }) {
  const [state, setState] = useState<{ statuses: Record<string, LegStatus>; now: Date | null }>({ statuses: initial, now: null });
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setState({ statuses: computeStatuses(legs, now), now });
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [legs]);
  return <LegCtx.Provider value={{ legs, ...state }}>{children}</LegCtx.Provider>;
}

export function useLegs() {
  const c = useContext(LegCtx);
  if (!c) throw new Error("useLegs must be used inside LegStatusProvider");
  return c;
}
export function useLegStatus(slug: string, fallback: LegStatus): LegStatus {
  const c = useContext(LegCtx);
  return c?.statuses[slug] ?? fallback;
}
