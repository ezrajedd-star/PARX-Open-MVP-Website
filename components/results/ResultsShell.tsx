import type { ReactNode } from "react";
import { getPoints, getSite } from "@/lib/content";
import { getLegsWithStatus } from "@/lib/data";
import { PageHero, SampleBadge } from "../ui/Section";
import { ResultsNav } from "./ResultsNav";

export function ResultsShell({ children, sample }: { children: ReactNode; sample: boolean }) {
  const site = getSite();
  const legs = getLegsWithStatus();
  const points = getPoints();
  const defaultLeg = [...legs].reverse().find((l) => l.hasResults)?.slug ?? legs[0].slug;
  return (
    <>
      <PageHero eyebrow={`Season ${site.season}`} title="Results & Standings" compact>
        Championship standings are calculated automatically from every leg&apos;s official results.
      </PageHero>
      <ResultsNav legs={legs.map((l) => ({ slug: l.slug, label: `R${l.round} · ${l.name}`, hasResults: l.hasResults }))} defaultLeg={defaultLeg} />
      <div className="bg-dust py-8 md:py-12">
        <div className="container-x">
          {sample && (
            <div role="note" className="mb-5 flex flex-wrap items-center gap-2 border-l-4 border-gold bg-white p-3 text-sm">
              <SampleBadge />
              <span className="text-ink/80">Round 1 results are fictional sample data used to demonstrate this page. Official results will replace them.</span>
            </div>
          )}
          {children}
          <details className="mt-8 bg-white p-4 text-sm ring-1 ring-navy/10">
            <summary className="cursor-pointer font-display text-base font-bold uppercase italic text-navy">Points system</summary>
            <p className="mt-3 text-ink/75">{points.note}</p>
            <ol className="mt-3 grid grid-cols-5 gap-1 sm:grid-cols-10">
              {points.positions.map((p, i) => (
                <li key={i} className="bg-dust p-2 text-center">
                  <span className="block text-xs text-ink/60">P{i + 1}</span>
                  <span className="font-display text-lg font-extrabold italic text-navy">{p}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-ink/75">
              DNF, DNS and DSQ score {points.statusPoints.DNF} points. Team score per leg = the best {points.teamScoringDrivers ?? "all"} drivers from each team. Ties are split on countback (most wins, then most 2nd places…).
            </p>
          </details>
        </div>
      </div>
    </>
  );
}
