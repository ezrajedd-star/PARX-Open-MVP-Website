import Link from "next/link";
import { notFound } from "next/navigation";
import { DriverAvatar } from "@/components/teams/DriverAvatar";
import { Photo } from "@/components/ui/Photo";
import { SampleBadge, SectionHeading } from "@/components/ui/Section";
import { getDriver, getDrivers, getSite, getTeam, photo } from "@/lib/content";
import { getChampionship } from "@/lib/data";
import { ordinal, tba } from "@/lib/format";
import { JsonLd, absUrl, pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ driver: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => getDrivers().map((d) => ({ driver: d.slug }));

export async function generateMetadata({ params }: Props) {
  const d = getDriver((await params).driver);
  if (!d) return {};
  return pageMeta({ title: `${d.displayName} — ${d.teamName}`, description: `${d.displayName}, ${d.independent ? "independent driver" : d.teamName} in the PARX Open rallycross championship. Car, number, standings and results.`, path: `/drivers/${d.slug}` });
}

export default async function DriverPage({ params }: Props) {
  const d = getDriver((await params).driver);
  if (!d) notFound();
  const team = getTeam(d.teamSlug)!;
  const site = getSite();
  const champ = getChampionship();
  const st = champ.drivers.find((r) => r.id === d.slug);
  const accent = team.independent ? "var(--parx-gold)" : team.colors.primary;
  const facts: [string, string][] = [
    ["Team", team.independent ? "Independent" : team.name],
    ["Car", tba(d.car)],
    ["Number", d.number != null ? `#${d.number}` : "TBA"],
    ["Hometown", tba(d.hometown)],
    ...(d.class ? ([["Class", d.class]] as [string, string][]) : []),
  ];

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Person", name: d.displayName, url: absUrl(`/drivers/${d.slug}`), memberOf: { "@type": "SportsTeam", name: team.name }, affiliation: { "@type": "SportsOrganization", name: site.name } }} />
      <section className="dust-texture relative overflow-hidden bg-navy text-white">
        <div className="speed-lines absolute inset-0" aria-hidden />
        <div className="absolute -right-16 top-0 h-full w-1/2 -skew-x-[24deg] opacity-40" style={{ background: accent }} aria-hidden />
        <div className="container-x relative grid gap-6 pb-8 pt-8 md:grid-cols-[minmax(0,380px)_1fr] md:items-end md:gap-10 md:pb-14 md:pt-14">
          <DriverAvatar slug={d.slug} name={d.displayName} className="aspect-[4/5] w-full max-w-[300px] md:max-w-none" accent={accent} sizes="(min-width:768px) 380px, 300px" />
          <div>
            <nav aria-label="Breadcrumb" className="mb-3 text-sm text-white/70">
              <Link href="/teams" className="hover:underline">Teams &amp; Drivers</Link> /{" "}
              {team.independent ? "Independent" : <Link href={`/teams/${team.slug}`} className="hover:underline">{team.name}</Link>}
            </nav>
            {d.isPrincipal && <p className="eyebrow mb-2 text-gold">Team principal &amp; driver</p>}
            <h1 className="heading text-7xl md:text-9xl">{d.displayName}</h1>
            {d.surname && <p className="heading text-3xl text-white/80">{d.surname}</p>}
            <div className="livery mt-5 w-48" aria-hidden />
            <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-md">
              <div className="bg-white/10 p-3">
                <p className="eyebrow text-[11px] text-white/70">Championship</p>
                <p className="heading mt-1 text-4xl tabular">{st ? ordinal(st.position) : "TBA"}</p>
              </div>
              <div className="bg-white/10 p-3">
                <p className="eyebrow text-[11px] text-white/70">Points</p>
                <p className="heading mt-1 text-4xl tabular">{st ? st.total : "TBA"}</p>
              </div>
            </div>
            {st && champ.hasSample && <SampleBadge className="mt-3 !text-gold" label="Sample data" />}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="container-x grid gap-8 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Profile" title="Driver & car" />
            <dl className="divide-y divide-navy/10 bg-white ring-1 ring-navy/10">
              {facts.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-4 py-3">
                  <dt className="eyebrow text-ink/60">{k}</dt>
                  <dd className={`text-right font-semibold ${v === "TBA" ? "text-ink/60" : "text-navy"}`}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <SectionHeading eyebrow="The machine" title="Car" as="h2" />
            <Photo src={photo("cars", d.slug)} alt={`${d.displayName}'s ${d.car ?? "car"}`} kind="car" className="aspect-[16/9]" accent={accent} sizes="(min-width:1024px) 50vw, 100vw" />
          </div>
        </div>
      </section>

      <section aria-labelledby="dres-h" className="bg-dust py-10 md:py-16">
        <div className="container-x">
          <SectionHeading eyebrow={`Season ${site.season}`} title={<span id="dres-h">Results by leg</span>} href="/results" linkLabel="Standings" />
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-5">
            {champ.legs.map((l) => {
              const c = st?.perLeg[l.slug];
              return (
                <li key={l.slug} className="flex items-center justify-between bg-white p-4 ring-1 ring-navy/10 sm:block">
                  <div>
                    <p className="eyebrow text-ink/60">Round {l.round}</p>
                    <p className="heading text-2xl text-navy">{l.name}</p>
                  </div>
                  <div className="text-right sm:mt-3 sm:text-left">
                    {c ? (
                      <>
                        <Link href={`/results/${l.slug}`} className="heading text-3xl text-navy hover:text-red">
                          {c.status === "FIN" ? `P${c.position}` : c.status}
                        </Link>
                        <p className="text-sm text-ink/70 tabular">{c.points} pts</p>
                      </>
                    ) : (
                      <p className="font-display text-lg font-bold uppercase text-ink/60">TBA</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
