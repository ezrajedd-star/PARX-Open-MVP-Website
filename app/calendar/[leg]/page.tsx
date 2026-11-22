import Link from "next/link";
import { notFound } from "next/navigation";
import { LegStatusBadge } from "@/components/calendar/LegStatusBadge";
import { VenueMap } from "@/components/calendar/VenueMap";
import { WeekendSchedule } from "@/components/calendar/WeekendSchedule";
import { ClassificationTable } from "@/components/results/ClassificationTable";
import { SponsorWall } from "@/components/sponsors/SponsorWall";
import { LinkButton } from "@/components/ui/Button";
import { ArrowRight, CalendarIcon, PinIcon } from "@/components/ui/Icons";
import { Photo } from "@/components/ui/Photo";
import { SampleBadge, SectionHeading } from "@/components/ui/Section";
import { getMerch, getSite } from "@/lib/content";
import { getLegsWithStatus } from "@/lib/data";
import { formatLegDates, formatPeso } from "@/lib/format";
import { classRowsForLeg } from "@/lib/results-view";
import { JsonLd, absUrl, pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ leg: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => getLegsWithStatus().map((l) => ({ leg: l.slug }));

export async function generateMetadata({ params }: Props) {
  const { leg: slug } = await params;
  const leg = getLegsWithStatus().find((l) => l.slug === slug);
  if (!leg) return {};
  return pageMeta({
    title: `Round ${leg.round}: ${leg.name}`,
    description: `PARX Open Round ${leg.round} — ${leg.name}, ${leg.province} (${leg.islandGroup}). ${formatLegDates(leg.dates)}. Schedule, venue, spectator info and results.`,
    path: `/calendar/${leg.slug}`,
  });
}

const SPECTATOR_FALLBACK = {
  gettingThere: "Directions to the venue will be published once the location is confirmed. Check our Facebook page for updates in the week before the race.",
  food: "Local food vendors and refreshments will be available at the venue. Vendor list to be announced.",
  parking: "Spectator parking details to be announced. Please follow marshals' instructions on the day.",
};

export default async function LegPage({ params }: Props) {
  const { leg: slug } = await params;
  const legs = getLegsWithStatus();
  const idx = legs.findIndex((l) => l.slug === slug);
  if (idx < 0) notFound();
  const leg = legs[idx];
  const prev = legs[idx - 1];
  const next = legs[idx + 1];
  const site = getSite();
  const results = leg.hasResults ? classRowsForLeg(leg.slug) : null;
  const legMerch = getMerch().filter((m) => m.legSlug === leg.slug);
  const info = { ...SPECTATOR_FALLBACK, ...Object.fromEntries(Object.entries(leg.spectatorInfo ?? {}).filter(([, v]) => v)) };
  const isPlaceholderInfo = !leg.spectatorInfo;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SportsEvent",
          name: `${site.name} Round ${leg.round} — ${leg.name}`,
          sport: "Rallycross",
          url: absUrl(`/calendar/${leg.slug}`),
          ...(leg.dates ? { startDate: `${leg.dates.start}T00:00:00+08:00`, endDate: `${leg.dates.end}T23:59:00+08:00` } : {}),
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          location: {
            "@type": "Place",
            name: leg.venue.name ?? `${leg.name}, ${leg.province}`,
            address: { "@type": "PostalAddress", addressLocality: leg.name, addressRegion: leg.province, addressCountry: "PH" },
            geo: { "@type": "GeoCoordinates", latitude: leg.coordinates.lat, longitude: leg.coordinates.lng },
          },
          organizer: { "@type": "SportsOrganization", name: site.name, url: absUrl("/") },
        }}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-navy text-white">
        <Photo src={leg.heroImage} alt="" kind="hero" className="absolute inset-0" priority sizes="100vw" showLabel={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/70 to-navy-deep/30" aria-hidden />
        <div className="container-x relative pb-8 pt-16 md:pb-14 md:pt-28">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-white/70">
            <Link href="/calendar" className="hover:text-white hover:underline">
              Calendar
            </Link>{" "}
            / <span aria-current="page">Round {leg.round}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            <LegStatusBadge slug={leg.slug} initial={leg.status} />
            <span className="bg-white/10 px-2 py-0.5 font-display text-xs font-bold uppercase tracking-wider">{leg.islandGroup}</span>
          </div>
          <div className="mt-3 flex items-end gap-4">
            <span className="heading text-[5.5rem] leading-[0.75] text-gold tabular md:text-[9rem]" aria-hidden>
              {String(leg.round).padStart(2, "0")}
            </span>
            <div>
              <p className="eyebrow text-white/75">Round {leg.round} of {legs.length}</p>
              <h1 className="heading text-6xl md:text-8xl">{leg.name}</h1>
            </div>
          </div>
          <div className="livery mt-6 w-48 md:w-72" aria-hidden />
          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2 md:flex md:gap-8">
            <div className="flex items-center gap-2">
              <dt>
                <CalendarIcon className="text-gold" />
                <span className="sr-only">Dates</span>
              </dt>
              <dd className="font-display text-lg font-bold uppercase tracking-wide">{formatLegDates(leg.dates)}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt>
                <PinIcon className="text-gold" />
                <span className="sr-only">Venue</span>
              </dt>
              <dd className="font-display text-lg font-bold uppercase tracking-wide">
                {leg.venue.name ?? "Venue TBA"} · {leg.province}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Results (after the race) */}
      {results && (
        <section aria-labelledby="results-h" className="bg-dust py-10 md:py-16">
          <div className="container-x">
            <SectionHeading eyebrow="Final classification" title={<span id="results-h">Results</span>} href={`/results/${leg.slug}`} linkLabel="Full results" />
            {results.sample && <SampleBadge className="mb-4" />}
            <ClassificationTable rows={results.rows} limit={10} caption={`Round ${leg.round} ${leg.name} — top 10`} />
            <LinkButton href={`/results/${leg.slug}`} variant="dark" className="mt-6 w-full sm:w-auto" arrow>
              Full results &amp; stage times
            </LinkButton>
          </div>
        </section>
      )}

      {/* Schedule */}
      <section aria-labelledby="sched-h" className={`${results ? "bg-white" : "bg-dust"} py-10 md:py-16`}>
        <div className="container-x">
          <SectionHeading eyebrow="Race weekend" title={<span id="sched-h">Schedule</span>} />
          <WeekendSchedule schedule={leg.schedule} />
          <p className="mt-3 text-sm text-ink/65">Times are Philippine Standard Time (PHT). The schedule may change; final times are confirmed at the drivers&apos; briefing.</p>
        </div>
      </section>

      {/* Gallery */}
      {leg.gallery.length > 0 && (
        <section aria-labelledby="gallery-h" className="container-x py-10 md:py-16">
          <SectionHeading eyebrow="Photo gallery" title={<span id="gallery-h">From the stages</span>} />
          <ul className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {leg.gallery.map((g) => (
              <li key={g.src}>
                <Photo src={g.src} alt={g.alt} className="aspect-square" sizes="(min-width:768px) 25vw, 50vw" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Venue + spectator info */}
      <section aria-labelledby="venue-h" className="py-10 md:py-16">
        <div className="container-x grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <SectionHeading eyebrow="Getting there" title={<span id="venue-h">Venue</span>} />
            <VenueMap lat={leg.coordinates.lat} lng={leg.coordinates.lng} label={`${leg.name}, ${leg.province}`} approximate={leg.coordinates.approximate} />
          </div>
          <div>
            <SectionHeading eyebrow="For fans" title="Spectator info" as="h2" />
            {isPlaceholderInfo && <SampleBadge label="Placeholder text" className="mb-4" />}
            <dl className="space-y-3">
              {[
                ["Getting there", info.gettingThere],
                ["Food & vendors", info.food],
                ["Parking", info.parking],
              ].map(([k, v]) => (
                <div key={k} className="border-l-4 border-gold bg-dust/60 p-4">
                  <dt className="heading text-xl text-navy">{k}</dt>
                  <dd className="mt-1 text-[15px] text-ink/80">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Leg sponsors */}
      <section aria-labelledby="leg-sponsors-h" className="bg-dust py-10 md:py-16">
        <div className="container-x">
          <SectionHeading eyebrow={`Round ${leg.round} · ${leg.name}`} title={<span id="leg-sponsors-h">Leg partners</span>} href="/sponsorship" linkLabel="Sponsor this leg" />
          <SponsorWall legSlug={leg.slug} tone="light" />
        </div>
      </section>

      {/* Leg edition merch */}
      {legMerch.length > 0 && (
        <section aria-labelledby="merch-h" className="bg-ink py-10 text-white md:py-14">
          <div className="container-x flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="eyebrow text-gold">Leg edition · only in {leg.name}</p>
              <h2 id="merch-h" className="heading mt-2 text-4xl">
                {legMerch.map((m) => m.name).join(", ")}
              </h2>
              <p className="mt-2 text-white/75">{legMerch.map((m) => formatPeso(m.price)).join(" · ")} · Sold at the venue only.</p>
            </div>
            <LinkButton href="/shop" variant="gold" arrow>
              See the shop
            </LinkButton>
          </div>
        </section>
      )}

      {/* Prev / next */}
      <nav aria-label="Other legs" className="border-t border-navy/10">
        <div className="container-x grid grid-cols-2 divide-x divide-navy/10">
          {prev ? (
            <Link href={`/calendar/${prev.slug}`} className="group py-6 pr-4">
              <span className="eyebrow text-ink/60">← Round {prev.round}</span>
              <span className="heading mt-1 block text-2xl text-navy group-hover:text-red md:text-3xl">{prev.name}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/calendar/${next.slug}`} className="group py-6 pl-4 text-right">
              <span className="eyebrow text-ink/60">Round {next.round} →</span>
              <span className="heading mt-1 flex items-center justify-end gap-1 text-2xl text-navy group-hover:text-red md:text-3xl">
                {next.name} <ArrowRight className="hidden md:block" aria-hidden />
              </span>
            </Link>
          ) : (
            <span />
          )}
        </div>
      </nav>
    </>
  );
}
