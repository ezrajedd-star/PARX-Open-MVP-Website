import Link from "next/link";
import { LegStripCard } from "@/components/calendar/LegCard";
import { DriverCtaBand } from "@/components/cta/CtaBands";
import { HeroMedia } from "@/components/home/HeroMedia";
import { HeroNextLeg } from "@/components/home/HeroNextLeg";
import { ArticleCard, FeaturedArticleCard } from "@/components/news/ArticleCard";
import { StandingsSnapshot } from "@/components/results/StandingsSnapshot";
import { SponsorWall } from "@/components/sponsors/SponsorWall";
import { TeamCard } from "@/components/teams/TeamCard";
import { LinkButton } from "@/components/ui/Button";
import { FacebookIcon } from "@/components/ui/Icons";
import { Placeholder } from "@/components/ui/Placeholder";
import { MobileViewAll, SampleBadge, SectionHeading } from "@/components/ui/Section";
import { getArticles, getMerch, getSite, getTeams } from "@/lib/content";
import { getLegsWithStatus } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { JsonLd, absUrl, pageMeta } from "@/lib/seo";

export const generateMetadata = () => pageMeta({ path: "/" });

export default function HomePage() {
  const site = getSite();
  const legs = getLegsWithStatus();
  const articles = getArticles();
  const featured = articles.find((a) => a.featured) ?? articles[0];
  const rest = articles.filter((a) => a !== featured).slice(0, 3);
  const teams = getTeams();
  const merch = getMerch().filter((m) => !m.comingSoon).slice(0, 3);
  const fb = site.social.find((s) => s.platform === "facebook");

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SportsOrganization",
          name: site.name,
          alternateName: site.fullName,
          sport: "Rallycross",
          url: absUrl("/"),
          logo: absUrl(site.logo),
          sameAs: site.social.map((s) => s.url),
        }}
      />

      {/* 1 — Hero */}
      <section className="relative isolate flex min-h-[calc(100svh-108px)] items-end overflow-hidden bg-navy text-white md:min-h-[640px]">
        <HeroMedia {...site.hero} />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/60 to-navy-deep/10 md:bg-gradient-to-r md:from-navy-deep md:via-navy-deep/70 md:to-transparent" aria-hidden />
        <div className="container-x relative pb-8 pt-24 md:pb-16">
          <p className="eyebrow text-gold">
            Season {site.season} · {site.fullName}
          </p>
          <h1 className="heading mt-3 text-[3.6rem] sm:text-7xl md:text-8xl lg:text-[7.5rem]">
            <span className="sr-only">{site.name}: </span>
            {site.tagline}
          </h1>
          <div className="livery mt-6 w-56 md:w-80" aria-hidden />
          <div className="mt-6 flex flex-col gap-6 md:mt-8 md:flex-row md:items-end md:justify-between">
            <HeroNextLeg />
            <div className="flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/calendar" variant="light" size="lg" arrow>
                See the Calendar
              </LinkButton>
              <LinkButton href="/sponsorship" variant="red" size="lg">
                Become a Sponsor
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — Latest news */}
      {featured && (
        <section aria-labelledby="news-h" className="container-x py-12 md:py-20">
          <SectionHeading eyebrow="Latest" title={<span id="news-h">News</span>} href="/news" linkLabel="All news" />
          <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
            <div className="lg:col-span-2">
              <FeaturedArticleCard a={featured} priority={false} fill />
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:col-span-1 lg:grid-cols-1 lg:content-start lg:gap-6">
              {rest.map((a) => (
                <ArticleCard key={a.slug} a={a} />
              ))}
            </div>
          </div>
          <MobileViewAll href="/news" label="All news" />
        </section>
      )}

      {/* 3 — Championship snapshot */}
      <section aria-labelledby="champ-h" className="dust-texture relative bg-navy py-12 text-white md:py-20">
        <div className="speed-lines absolute inset-0" aria-hidden />
        <div className="container-x relative">
          <SectionHeading eyebrow={`${site.season} Championship`} title={<span id="champ-h">Standings</span>} href="/results" linkLabel="Full standings" tone="dark" />
          <StandingsSnapshot />
        </div>
      </section>

      {/* 4 — Season calendar strip */}
      <section aria-labelledby="cal-h" className="bg-dust py-12 md:py-20">
        <div className="container-x">
          <SectionHeading eyebrow={`Season ${site.season}`} title={<span id="cal-h">The calendar</span>} href="/calendar" linkLabel="Full calendar" />
        </div>
        <div className="container-x">
          <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-6" aria-label="Season legs">
            {legs.map((l) => (
              <li key={l.slug} className="flex">
                <LegStripCard leg={l} />
              </li>
            ))}
            <li className="flex">
              <Link
                href="/host"
                className="group flex h-full min-h-[220px] w-[240px] shrink-0 snap-start flex-col justify-between border-2 border-dashed border-navy/30 p-4 text-navy transition hover:border-navy hover:bg-white md:w-full md:shrink"
              >
                <span className="heading text-5xl text-navy/30 tabular">+</span>
                <span>
                  <span className="eyebrow text-red">Your city?</span>
                  <span className="heading mt-1 block text-3xl">Want us in your city?</span>
                  <span className="mt-3 block border-t border-navy/15 pt-3 font-display text-sm font-bold uppercase tracking-wide group-hover:text-red">Let&apos;s talk →</span>
                </span>
              </Link>
            </li>
          </ul>
          <p className="mt-3 text-xs text-ink/60 md:hidden" aria-hidden>
            Swipe to see all {legs.length} legs →
          </p>
        </div>
      </section>

      {/* 5 — Title & Gold sponsors */}
      <section aria-labelledby="partners-h" className="container-x py-12 md:py-20">
        <SectionHeading eyebrow="Powering the championship" title={<span id="partners-h">Our partners</span>} href="/sponsorship" linkLabel="Partner with us" />
        <SponsorWall tiers={["title", "gold"]} tone="light" />
      </section>

      {/* 6 — Teams teaser */}
      <section aria-labelledby="teams-h" className="bg-dust py-12 md:py-20">
        <div className="container-x">
          <SectionHeading eyebrow="On the grid" title={<span id="teams-h">The teams</span>} href="/teams" linkLabel="All teams & drivers" />
          <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4" aria-label="Teams">
            {teams
              .filter((t) => !t.independent)
              .slice(0, 4)
              .map((t) => (
                <li key={t.slug} className="flex w-[80%] shrink-0 snap-start sm:w-[45%] md:w-auto">
                  <TeamCard team={t} className="w-full" />
                </li>
              ))}
          </ul>
          <MobileViewAll href="/teams" label="All teams & drivers" />
        </div>
      </section>

      {/* 6b — Driver pipeline */}
      <DriverCtaBand eyebrow="Race in PARX Open" />

      {/* 7 — Shop teaser */}
      <section aria-labelledby="shop-h" className="relative overflow-hidden bg-ink text-white">
        <div className="container-x grid items-center gap-8 py-12 md:grid-cols-2 md:py-20">
          <div>
            <p className="eyebrow text-gold">Official merchandise</p>
            <h2 id="shop-h" className="heading mt-2 text-5xl md:text-6xl">
              Only at the track.
            </h2>
            <p className="mt-4 max-w-md text-white/80">No online store, no reprints. PARX Open gear is sold only at race venues — with limited Leg Edition drops at every round.</p>
            <LinkButton href="/shop" variant="gold" className="mt-6" arrow>
              See the collection
            </LinkButton>
          </div>
          <ul className="grid grid-cols-3 gap-2 md:gap-3">
            {merch.map((m) => (
              <li key={m.slug}>
                <Placeholder kind="merch" className="aspect-[3/4]" showLabel={false} label={m.name} />
                <p className="mt-2 font-display text-sm font-bold uppercase italic leading-tight">{m.name}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 8 — Social band */}
      <section aria-labelledby="social-h" className="bg-[#0B57D0] text-white">
        <div className="container-x py-12 md:py-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow text-white/80">Join the paddock</p>
              <h2 id="social-h" className="heading mt-2 text-5xl">
                Follow us on Facebook
              </h2>
              <p className="mt-3 max-w-lg text-white/90">Live updates, stage highlights and results from every leg — first on our Facebook page.</p>
            </div>
            {fb && (
              <a href={fb.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-13 items-center justify-center gap-2 bg-white px-6 font-display text-lg font-bold uppercase italic text-[#0d4fb0] hover:bg-dust">
                <FacebookIcon /> Follow {site.facebookPageName}
              </a>
            )}
          </div>
          <ul className="mt-8 grid gap-3 md:grid-cols-3">
            {site.socialPosts.map((p, i) => (
              <li key={i} className="flex flex-col bg-white p-4 text-ink">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center bg-navy text-white" aria-hidden>
                    <FacebookIcon width={18} height={18} />
                  </span>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold">{site.facebookPageName}</p>
                    <p className="text-xs text-ink/60">{p.date ? formatDate(p.date, "short") : "Date TBA"}</p>
                  </div>
                  {p.sample && <SampleBadge label="Sample" className="ml-auto" />}
                </div>
                <p className="mt-3 text-sm">{p.text}</p>
                {p.url && (
                  <Link href={p.url} className="mt-3 text-sm font-semibold text-[#0d4fb0] underline">
                    View on Facebook
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
