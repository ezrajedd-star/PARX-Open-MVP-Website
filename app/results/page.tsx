import { ResultsShell } from "@/components/results/ResultsShell";
import { StandingsTable } from "@/components/results/StandingsTable";
import { getChampionship } from "@/lib/data";
import { pageMeta } from "@/lib/seo";
import { driverEntities } from "@/lib/standings-view";

export const generateMetadata = () => pageMeta({ title: "Driver Standings", description: "PARX Open drivers' championship standings — points per round, totals and movement.", path: "/results" });

export default function DriverStandingsPage() {
  const c = getChampionship();
  return (
    <ResultsShell sample={c.hasSample}>
      <h2 className="heading mb-4 text-4xl text-navy">Driver standings</h2>
      {c.drivers.length ? (
        <StandingsTable kind="Driver" rows={c.drivers} entities={driverEntities()} legs={c.legs} caption="Drivers' championship standings" />
      ) : (
        <p>Standings appear after Round 1.</p>
      )}
      <p className="mt-2 text-xs text-ink/60 md:hidden">Swipe the table sideways to see every round.</p>
    </ResultsShell>
  );
}
