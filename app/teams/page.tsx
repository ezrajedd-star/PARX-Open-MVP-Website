import { DriverCard } from "@/components/teams/DriverCard";
import { TeamCard } from "@/components/teams/TeamCard";
import { PageHero, SectionHeading } from "@/components/ui/Section";
import { getDrivers, getTeams } from "@/lib/content";
import { pageMeta } from "@/lib/seo";

export const generateMetadata = () =>
  pageMeta({ title: "Teams & Drivers", description: "Every team and driver on the PARX Open rallycross grid — team principals, rosters, cars and championship positions.", path: "/teams" });

export default function TeamsPage() {
  const teams = getTeams();
  const regular = teams.filter((t) => !t.independent);
  const indies = teams.filter((t) => t.independent);
  const driverCount = getDrivers().length;
  return (
    <>
      <PageHero eyebrow="The grid" title="Teams & Drivers">
        {regular.length} teams and {driverCount} drivers chasing the first PARX Open title.
      </PageHero>
      <section aria-labelledby="teams-h" className="bg-dust py-10 md:py-16">
        <div className="container-x">
          <SectionHeading eyebrow={`${regular.length} teams`} title={<span id="teams-h">Teams</span>} />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {regular.map((t) => (
              <li key={t.slug} className="flex [&>*]:w-full">
                <TeamCard team={t} />
              </li>
            ))}
          </ul>
        </div>
      </section>
      {indies.map((t) => (
        <section key={t.slug} aria-labelledby={`${t.slug}-h`} className="py-10 md:py-16">
          <div className="container-x">
            <SectionHeading eyebrow="Free agents" title={<span id={`${t.slug}-h`}>{t.name}</span>} />
            <p className="-mt-3 mb-6 max-w-2xl text-ink/75">Drivers racing without a team. They score in the drivers&apos; championship but not the teams&apos; championship.</p>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {t.drivers.map((d) => (
                <li key={d.slug} className="flex [&>*]:w-full">
                  <DriverCard d={{ ...d, teamSlug: t.slug, teamName: t.name, independent: true, isPrincipal: false }} accent="var(--parx-navy)" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}
    </>
  );
}
