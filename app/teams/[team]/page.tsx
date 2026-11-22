import Link from "next/link";
import { notFound } from "next/navigation";
import { DriverCard } from "@/components/teams/DriverCard";
import { LinkButton } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { SampleBadge, SectionHeading } from "@/components/ui/Section";
import { getDrivers, getSite, getTeam, getTeams } from "@/lib/content";
import { getChampionship } from "@/lib/data";
import { ordinal } from "@/lib/format";
import { JsonLd, absUrl, pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ team: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => getTeams().filter((t) => !t.independent).map((t) => ({ team: t.slug }));

export async function generateMetadata({ params }: Props) {
  const t = getTeam((await params).team);
  if (!t) return {};
  return pageMeta({ title: t.name, description: `${t.name} — team principal ${t.principal ?? "TBA"}, ${t.drivers.length} drivers. Roster, standings and partners.`, path: `/teams/${t.slug}` });
}

export default async function TeamPage({ params }: Props) {
  const team = getTeam((await params).team);
  if (!team || team.independent) notFound();
  const site = getSite();
  const drivers = getDrivers().filter((d) => d.teamSlug === team.slug);
  const champ = getChampionship();
  const standing = champ.teams.find((r) => r.id === team.slug);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SportsTeam",
          name: team.name,
          sport: "Rallycross",
          url: absUrl(`/teams/${team.slug}`),
          memberOf: { "@type": "SportsOrganization", name: site.name },
          ...(team.principal ? { coach: { "@type": "Person", name: team.principal } } : {}),
          athlete: drivers.map((d) => ({ "@type": "Person", name: d.displayName, url: absUrl(`/drivers/${d.slug}`) })),
        }}
      />
      <section className="relative isolate overflow-hidden text-white" style={{ background: team.colors.primary }}>
        <Photo src={team.heroImage} alt="" kind="car" className="absolute inset-0" priority sizes="100vw" accent={team.colors.secondary} placeholderLabel="Team car photo" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/60 to-navy-deep/0" aria-hidden />
        <div className="absolute -right-10 top-0 h-full w-1/3 -skew-x-[24deg] opacity-80" style={{ background: team.colors.primary }} aria-hidden />
        <div className="absolute right-[18%] top-0 h-full w-6 -skew-x-[24deg]" style={{ background: team.colors.secondary }} aria-hidden />
        <div className="container-x relative pb-8 pt-20 md:pb-14 md:pt-36">
          <nav aria-label="Breadcrumb" className="mb-3 text-sm text-white/75">
            <Link href="/teams" className="hover:underline">Teams &amp; Drivers</Link> / <span aria-current="page">{team.name}</span>
          </nav>
          <h1 className="heading text-6xl md:text-8xl">{team.name}</h1>
          <div className="livery mt-5 w-48" aria-hidden />
          <dl className="mt-6 grid grid-cols-3 gap-3 sm:max-w-xl">
            <div className="bg-navy-deep/60 p-3 backdrop-blur-sm">
              <dt className="eyebrow text-[11px] text-white/70">Principal</dt>
              <dd className="mt-1 font-display text-lg font-bold uppercase italic leading-tight">{team.principal ?? "TBA"}</dd>
            </div>
            <div className="bg-navy-deep/60 p-3 backdrop-blur-sm">
              <dt className="eyebrow text-[11px] text-white/70">Drivers</dt>
              <dd className="heading mt-1 text-3xl tabular">{drivers.length}</dd>
            </div>
            <div className="bg-navy-deep/60 p-3 backdrop-blur-sm">
              <dt className="eyebrow text-[11px] text-white/70">Standings</dt>
              <dd className="heading mt-1 text-3xl tabular">
                {standing ? ordinal(standing.position) : "TBA"}
                {standing && <span className="block text-sm not-italic text-white/75">{standing.total} pts</span>}
              </dd>
            </div>
          </dl>
          {standing && champ.hasSample && <SampleBadge className="mt-3 !text-gold" label="Standings use sample data" />}
        </div>
      </section>

      <section aria-labelledby="roster-h" className="bg-dust py-10 md:py-16">
        <div className="container-x">
          <SectionHeading eyebrow={`${drivers.length} drivers`} title={<span id="roster-h">Driver roster</span>} />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {drivers.map((d) => (
              <li key={d.slug} className="flex [&>*]:w-full">
                <DriverCard d={d} accent={team.colors.primary} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="tsp-h" className="py-10 md:py-16">
        <div className="container-x">
          <SectionHeading eyebrow="Team partners" title={<span id="tsp-h">Sponsors</span>} />
          {team.sponsors.length ? (
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {team.sponsors.map((s) => (
                <li key={s.name} className="grid h-20 place-items-center bg-dust font-display font-bold uppercase italic text-navy">
                  {s.url ? <a href={s.url} target="_blank" rel="noopener sponsored">{s.name}</a> : s.name}
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col gap-4 border-2 border-dashed border-navy/20 p-6 md:flex-row md:items-center md:justify-between">
              <p className="text-ink/75">Team sponsors to be announced. Want your brand on {team.name}&apos;s cars? Team deals are negotiated directly with the team principal.</p>
              <LinkButton href="/sponsorship#other-ways" variant="ghost-dark" size="sm">Sponsor a team</LinkButton>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
