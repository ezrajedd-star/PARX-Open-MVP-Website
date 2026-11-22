import Link from "next/link";
import { FootprintMap } from "@/components/sponsorship/FootprintMap";
import { InquiryForm } from "@/components/sponsorship/InquiryForm";
import { SponsorWall } from "@/components/sponsors/SponsorWall";
import { LinkButton } from "@/components/ui/Button";
import { CheckIcon, DownloadIcon, MinusIcon } from "@/components/ui/Icons";
import { SampleBadge, SectionHeading } from "@/components/ui/Section";
import { getLegs, getSite, getSponsorship, publicFileExists } from "@/lib/content";
import { formatPeso } from "@/lib/format";
import { pageMeta } from "@/lib/seo";

export const generateMetadata = () =>
  pageMeta({ title: "Sponsorship", description: "Partner with PARX Open. Title, Gold, Silver, Bronze and Local Partner packages per leg across the Visayas and Mindanao, plus season bundles.", path: "/sponsorship" });

const TIER_STYLE: Record<string, { bar: string; chip: string }> = {
  title: { bar: "bg-gold", chip: "bg-gold text-navy" },
  gold: { bar: "bg-gold", chip: "bg-gold/20 text-[#7a5400]" },
  silver: { bar: "bg-silver", chip: "bg-silver/40 text-navy" },
  bronze: { bar: "bg-bronze", chip: "bg-bronze/20 text-[#7a4510]" },
  local: { bar: "bg-dust-dark", chip: "bg-dust text-navy" },
};

function Benefit({ v }: { v: boolean | string }) {
  if (v === true) return <CheckIcon className="mx-auto text-green-700" aria-label="Included" title="Included" />;
  if (v === false) return <MinusIcon className="mx-auto text-ink/30" aria-label="Not included" title="Not included" />;
  return <span className={v === "TBA" ? "text-ink/60" : "font-semibold text-navy"}>{v}</span>;
}

export default function SponsorshipPage() {
  const site = getSite();
  const sp = getSponsorship();
  const legs = getLegs();
  const deck = site.sponsorDeck && publicFileExists(site.sponsorDeck) ? site.sponsorDeck : null;

  return (
    <>
      {/* 1 Hero */}
      <section className="dust-texture relative isolate overflow-hidden bg-navy text-white">
        <div className="speed-lines absolute inset-0" aria-hidden />
        <div className="absolute -right-24 top-0 h-full w-3/4 -skew-x-[24deg] bg-gradient-to-l from-red/40 to-transparent md:w-1/2" aria-hidden />
        <div className="absolute right-[12%] top-0 hidden h-full w-8 -skew-x-[24deg] bg-gold md:block" aria-hidden />
        <div className="container-x relative py-14 md:py-24">
          <p className="eyebrow text-gold">Sponsorship · Season {site.season}</p>
          <h1 className="heading mt-3 max-w-4xl text-[3.2rem] sm:text-7xl md:text-8xl">{sp.hero.title}</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/85">{sp.hero.subtitle}</p>
          <div className="livery mt-8 w-56" aria-hidden />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="#inquire" variant="red" size="lg" arrow>Start a conversation</LinkButton>
            {deck && (
              <a href={deck} download className="inline-flex h-13 items-center justify-center gap-2 border-2 border-white/80 px-6 font-display text-lg font-bold uppercase italic text-white hover:bg-white hover:text-navy">
                <DownloadIcon /> Sponsor deck (PDF)
              </a>
            )}
          </div>
        </div>
      </section>

      {/* 2 Why PARX */}
      <section aria-labelledby="why-h" className="py-12 md:py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Why PARX Open" title={<span id="why-h">Reach that races</span>} />
          <ul className="grid grid-cols-2 gap-2 md:grid-cols-5 md:gap-3">
            {site.stats.map((s) => (
              <li key={s.label} className="relative overflow-hidden bg-navy p-4 text-white md:p-5">
                <span className="absolute inset-x-0 top-0 h-1 bg-gold" aria-hidden />
                <p className={`heading text-5xl tabular md:text-6xl ${s.value ? "" : "text-white/55"}`}>{s.value ?? "TBA"}</p>
                <p className="eyebrow mt-2 text-[11px] text-white/75">{s.label}</p>
              </li>
            ))}
          </ul>
          {site.stats.some((s) => !s.value) && <p className="mt-2 text-xs text-ink/60">Audience figures will be published once verified.</p>}
        </div>
      </section>

      <section aria-labelledby="foot-h" className="dust-texture relative bg-navy py-12 text-white md:py-20">
        <div className="speed-lines absolute inset-0" aria-hidden />
        <div className="container-x relative grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading eyebrow="Regional footprint" title={<span id="foot-h">Five cities. Two island groups.</span>} tone="dark" />
            <p className="text-lg text-white/85">{sp.footprint}</p>
            <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {legs.map((l) => (
                <li key={l.slug} className="border-l-4 border-gold bg-white/5 px-3 py-2">
                  <span className="eyebrow text-[11px] text-white/60">Round {l.round}</span>
                  <span className="heading block text-2xl">{l.name}</span>
                  <span className="text-xs text-white/70">{l.islandGroup}</span>
                </li>
              ))}
            </ul>
          </div>
          <FootprintMap legs={legs} />
        </div>
      </section>

      <section aria-labelledby="machine-h" className="bg-dust py-12 md:py-20">
        <div className="container-x">
          <SectionHeading eyebrow="The content machine" title={<span id="machine-h">Every leg, everywhere</span>} />
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {sp.contentMachine.map((c, i) => (
              <li key={c.title} className="bg-white p-5 ring-1 ring-navy/10">
                <span className="heading text-4xl text-red tabular">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="heading mt-2 text-3xl text-navy">{c.title}</h3>
                <p className="mt-2 text-[15px] text-ink/75">{c.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 3 Tiers */}
      <section aria-labelledby="tiers-h" className="py-12 md:py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Packages per leg" title={<span id="tiers-h">Choose your grid position</span>} />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {sp.tiers.map((t) => (
              <li key={t.id} className={`relative flex flex-col overflow-hidden p-5 ring-1 ${t.highlight ? "bg-navy text-white ring-navy lg:-my-3 lg:py-8" : "bg-white text-navy ring-navy/15"}`}>
                <span className={`absolute inset-x-0 top-0 h-1.5 ${TIER_STYLE[t.id].bar}`} aria-hidden />
                {t.highlight && <span className="mb-2 self-start bg-red px-2 py-0.5 font-display text-xs font-extrabold uppercase italic tracking-wider text-white">Naming rights</span>}
                <h3 className="heading text-4xl">{t.name}</h3>
                <p className={`mt-3 font-display text-4xl font-extrabold italic tabular ${t.highlight ? "text-gold" : "text-navy"}`}>{t.pricePerLeg != null ? formatPeso(t.pricePerLeg) : t.priceLabel}</p>
                <p className={`text-xs uppercase tracking-wider ${t.highlight ? "text-white/70" : "text-ink/60"}`}>{t.pricePerLeg != null ? "per leg" : "value exchange"}</p>
                <p className={`mt-3 text-[15px] ${t.highlight ? "text-white/85" : "text-ink/75"}`}>{t.summary}</p>
                <Link href="#inquire" className={`mt-auto pt-5 font-display font-bold uppercase italic underline-offset-2 hover:underline ${t.highlight ? "text-gold" : "text-red"}`}>
                  Inquire about {t.name} →
                </Link>
              </li>
            ))}
          </ul>

          <h3 className="heading mb-3 mt-12 text-3xl text-navy">Benefits matrix</h3>
          <SampleBadge label="Placeholder benefits" className="mb-3" />
          <p className="mb-3 text-sm text-ink/70">{sp.benefitsNote}</p>
          <div className="overflow-x-auto bg-white ring-1 ring-navy/10" tabIndex={0} role="region" aria-label="Benefits by tier (scrolls horizontally)">
            <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
              <caption className="sr-only">Sponsorship benefits by tier</caption>
              <thead>
                <tr className="font-display text-sm font-bold uppercase tracking-wide">
                  <th scope="col" className="sticky left-0 z-10 bg-navy px-3 py-3 text-left text-white">Benefit</th>
                  {sp.tiers.map((t) => (
                    <th key={t.id} scope="col" className={`px-3 py-3 text-center ${t.highlight ? "bg-red text-white" : "bg-navy text-white"}`}>{t.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sp.benefits.map((b) => (
                  <tr key={b.label} className="even:bg-dust/40">
                    <th scope="row" className="sticky left-0 z-10 border-t border-r border-navy/10 bg-white px-3 py-3 text-left font-semibold text-navy">{b.label}</th>
                    {sp.tiers.map((t) => (
                      <td key={t.id} className="border-t border-navy/10 px-3 py-3 text-center">
                        <Benefit v={b.values[t.id] ?? false} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4 Season bundle */}
      <section aria-labelledby="bundle-h" className="container-x pb-12 md:pb-20">
        <div className="relative overflow-hidden bg-gold p-6 text-navy md:p-10">
          <div className="absolute -right-10 top-0 h-full w-40 -skew-x-[24deg] bg-red" aria-hidden />
          <div className="absolute right-36 top-0 h-full w-6 -skew-x-[24deg] bg-white/60" aria-hidden />
          <div className="relative max-w-2xl">
            <p className="eyebrow">Best value</p>
            <h2 id="bundle-h" className="heading mt-2 text-4xl md:text-6xl">{sp.seasonBundle.title}</h2>
            <p className="mt-3 text-lg">{sp.seasonBundle.text}</p>
            <p className="mt-4 font-display text-2xl font-extrabold italic">
              {sp.seasonBundle.discountPercent != null ? `Save ${sp.seasonBundle.discountPercent}% versus per-leg pricing` : "Season discount: TBA"}
            </p>
            <LinkButton href="#inquire" variant="dark" className="mt-5" arrow>Ask about the season bundle</LinkButton>
          </div>
        </div>
      </section>

      {/* 5 Other ways */}
      <section id="other-ways" aria-labelledby="other-h" className="bg-dust py-12 md:py-20">
        <div className="container-x">
          <SectionHeading eyebrow="More ways in" title={<span id="other-h">Other ways to get involved</span>} />
          <ul className="grid gap-3 md:grid-cols-2">
            {sp.otherWays.map((o) => (
              <li key={o.title} className="flex flex-col bg-white p-6 ring-1 ring-navy/10">
                <h3 className="heading text-3xl text-navy">{o.title}</h3>
                <p className="mt-2 text-ink/75">{o.text}</p>
                <LinkButton href="/teams" variant="ghost-dark" size="sm" className="mt-5 self-start" arrow>Browse teams &amp; drivers</LinkButton>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Current partners */}
      <section aria-labelledby="cur-h" className="py-12 md:py-20">
        <div className="container-x">
          <SectionHeading eyebrow="In good company" title={<span id="cur-h">Current partners</span>} />
          <SponsorWall tone="light" cta={false} />
        </div>
      </section>

      {/* 6 Inquiry */}
      <section id="inquire" aria-labelledby="inq-h" className="dust-texture relative scroll-mt-32 bg-navy py-12 text-white md:py-20">
        <div className="speed-lines absolute inset-0" aria-hidden />
        <div className="container-x relative grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionHeading eyebrow="Let's talk" title={<span id="inq-h">Become a sponsor</span>} tone="dark" />
            <p className="text-lg text-white/85">Tell us about your brand and the legs you&apos;re interested in. We&apos;ll reply with the sponsor deck and availability.</p>
            <p className="mt-6 text-white/75">
              Prefer email? <a href={`mailto:${site.sponsorshipEmail}`} className="font-semibold text-gold underline underline-offset-2">{site.sponsorshipEmail}</a>
            </p>
            {deck && (
              <a href={deck} download className="mt-6 inline-flex items-center gap-2 font-display text-lg font-bold uppercase italic text-white underline-offset-4 hover:underline">
                <DownloadIcon /> Download the sponsor deck (PDF)
              </a>
            )}
          </div>
          <InquiryForm tiers={sp.tiers.map((t) => ({ id: t.id, name: t.name }))} legs={legs.map((l) => ({ slug: l.slug, label: `R${l.round} ${l.name}` }))} email={site.sponsorshipEmail} siteName={site.name} />
        </div>
      </section>
    </>
  );
}
