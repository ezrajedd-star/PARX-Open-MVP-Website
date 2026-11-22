import type { StandingEntity } from "@/components/results/StandingsTable";
import { getDrivers, getTeams } from "./content";

export function driverEntities() {
  const teams = new Map(getTeams().map((t) => [t.slug, t]));
  return new Map<string, StandingEntity>(
    getDrivers().map((d) => {
      const t = teams.get(d.teamSlug)!;
      return [d.slug, { id: d.slug, name: d.displayName, sub: t.independent ? "Independent" : t.name, color: t.independent ? "#E9E4DA" : t.colors.primary, href: `/drivers/${d.slug}` }];
    }),
  );
}
export function teamEntities() {
  return new Map<string, StandingEntity>(
    getTeams()
      .filter((t) => !t.independent)
      .map((t) => [t.slug, { id: t.slug, name: t.name, sub: t.principal ? `Principal: ${t.principal}` : "", color: t.colors.primary, href: `/teams/${t.slug}` }]),
  );
}
