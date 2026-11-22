import { ResultsShell } from "@/components/results/ResultsShell";
import { StandingsTable } from "@/components/results/StandingsTable";
import { getChampionship } from "@/lib/data";
import { pageMeta } from "@/lib/seo";
import { teamEntities } from "@/lib/standings-view";

export const generateMetadata = () => pageMeta({ title: "Team Standings", description: "PARX Open teams' championship standings — points per round and totals.", path: "/results/teams" });

export default function TeamStandingsPage() {
  const c = getChampionship();
  return (
    <ResultsShell sample={c.hasSample}>
      <h2 className="heading mb-4 text-4xl text-navy">Team standings</h2>
      {c.teams.length ? (
        <StandingsTable kind="Team" rows={c.teams} entities={teamEntities()} legs={c.legs} caption="Teams' championship standings" />
      ) : (
        <p>Standings appear after Round 1.</p>
      )}
    </ResultsShell>
  );
}
