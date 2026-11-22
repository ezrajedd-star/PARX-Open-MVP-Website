import { CalendarFilter } from "@/components/calendar/CalendarFilter";
import { LegCard } from "@/components/calendar/LegCard";
import { PageHero } from "@/components/ui/Section";
import { getSite } from "@/lib/content";
import { getLegsWithStatus } from "@/lib/data";
import { JsonLd, absUrl, pageMeta } from "@/lib/seo";

export const generateMetadata = () =>
  pageMeta({ title: "Calendar", description: "All five legs of the PARX Open rallycross season across the Visayas and Mindanao — dates, venues and event details.", path: "/calendar" });

export default function CalendarPage() {
  const site = getSite();
  const legs = getLegsWithStatus();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `${site.name} ${site.season} calendar`,
          itemListElement: legs.map((l, i) => ({ "@type": "ListItem", position: i + 1, url: absUrl(`/calendar/${l.slug}`), name: `Round ${l.round} — ${l.name}` })),
        }}
      />
      <PageHero eyebrow={`Season ${site.season}`} title="Calendar">
        Five legs across two island groups. Dates are published here as soon as each leg is confirmed.
      </PageHero>
      <section className="bg-dust py-8 md:py-14">
        <div className="container-x">
          <CalendarFilter items={legs.map((l, i) => ({ key: l.slug, group: l.islandGroup, node: <LegCard leg={l} priority={i === 0} /> }))} />
        </div>
      </section>
    </>
  );
}
