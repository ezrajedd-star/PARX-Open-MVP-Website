import { NextLegLink } from "@/components/shop/NextLegLink";
import { Photo } from "@/components/ui/Photo";
import { getLegs, getMerch, getSite, photo } from "@/lib/content";
import { formatPeso } from "@/lib/format";
import { pageMeta } from "@/lib/seo";

export const generateMetadata = () =>
  pageMeta({ title: "Shop — Only at the track", description: "Official PARX Open merchandise, sold only at race venues. Tees, caps, umbrellas and limited Leg Edition drops.", path: "/shop" });

const BADGE = {
  "only-at-venues": { label: "Only at race venues", cls: "bg-navy text-white" },
  "limited-per-leg": { label: "Limited per leg", cls: "bg-red text-white" },
} as const;

export default function ShopPage() {
  const site = getSite();
  const items = getMerch();
  const legs = new Map(getLegs().map((l) => [l.slug, l]));
  const core = items.filter((i) => !i.legSlug);
  const editions = items.filter((i) => i.legSlug);

  const Card = ({ it }: { it: (typeof items)[number] }) => {
    const leg = it.legSlug ? legs.get(it.legSlug) : null;
    return (
      <article className={`flex h-full flex-col bg-white ring-1 ring-navy/10`}>
        <div className="relative">
          <Photo src={it.image ?? photo("merch", it.slug)} alt={it.name} kind="merch" className="aspect-square" tone={it.comingSoon ? "dust" : "navy"} sizes="(min-width:1024px) 25vw, 50vw" placeholderLabel="Product photo" />
          <span className={`absolute left-2 top-2 px-2 py-0.5 font-display text-[11px] font-extrabold uppercase italic tracking-wider ${BADGE[it.badge].cls}`}>{BADGE[it.badge].label}</span>
          {leg && <span className="absolute left-2 top-8 bg-gold px-2 py-0.5 font-display text-[11px] font-extrabold uppercase italic tracking-wider text-navy">R{leg.round} {leg.name} edition</span>}
        </div>
        <div className="flex flex-1 flex-col p-3 md:p-4">
          <h3 className="heading text-2xl text-navy">{it.name}</h3>
          <p className="mt-1 text-sm text-ink/70">{it.description}</p>
          {!it.comingSoon && (
            <>
              <p className={`mt-3 font-display text-2xl font-extrabold italic tabular ${it.price == null ? "text-ink/60" : "text-navy"}`}>{formatPeso(it.price)}</p>
              <dl className="mt-2 space-y-1 text-xs">
                {it.sizes.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    <dt className="sr-only">Sizes</dt>
                    {it.sizes.map((s) => (
                      <dd key={s} className="border border-navy/20 px-1.5 py-0.5 font-semibold text-navy">{s}</dd>
                    ))}
                  </div>
                )}
                {it.colors.length > 0 && (
                  <div className="flex gap-1 text-ink/70">
                    <dt>Colours:</dt>
                    <dd>{it.colors.join(", ")}</dd>
                  </div>
                )}
              </dl>
            </>
          )}
        </div>
      </article>
    );
  };

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div className="speed-lines absolute inset-0" aria-hidden />
        <div className="absolute -right-20 top-0 h-full w-2/3 -skew-x-[24deg] bg-gradient-to-l from-gold/25 to-transparent" aria-hidden />
        <div className="container-x relative py-14 md:py-24">
          <p className="eyebrow text-gold">Official {site.name} merchandise</p>
          <h1 className="heading mt-3 text-6xl md:text-8xl">Only at the track.</h1>
          <p className="mt-4 max-w-xl text-lg text-white/85">No online store. No reprints. Our gear is sold only at race venues — and every leg drops its own limited edition. If you were there, you&apos;ll have the shirt to prove it.</p>
          <div className="livery mt-8 w-56" aria-hidden />
          <div className="mt-8">
            <NextLegLink />
          </div>
        </div>
      </section>

      <section aria-labelledby="core-h" className="bg-dust py-10 md:py-16">
        <div className="container-x">
          <h2 id="core-h" className="heading mb-6 text-4xl text-navy md:text-5xl">The collection</h2>
          <ul className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {core.map((it) => (
              <li key={it.slug}>
                <Card it={it} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="ed-h" className="py-10 md:py-16">
        <div className="container-x">
          <p className="eyebrow text-red">The drop</p>
          <h2 id="ed-h" className="heading mt-1 text-4xl text-navy md:text-5xl">Leg editions</h2>
          <p className="mt-3 max-w-2xl text-ink/75">Each round gets its own design, sold only at that venue in a limited run. When it&apos;s gone, it&apos;s gone.</p>
          <ul className="mt-6 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {editions.map((it) => (
              <li key={it.slug}>
                <Card it={it} />
              </li>
            ))}
            {[...legs.values()]
              .filter((l) => !editions.some((e) => e.legSlug === l.slug))
              .map((l) => (
                <li key={l.slug} className="flex flex-col justify-between border-2 border-dashed border-navy/20 p-4">
                  <span className="heading text-5xl text-navy/20 tabular">{String(l.round).padStart(2, "0")}</span>
                  <div>
                    <p className="heading text-2xl text-navy">{l.name} edition</p>
                    <p className="text-sm text-ink/60">Design reveal coming soon</p>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </section>

      <section className="bg-navy py-10 text-white md:py-14">
        <div className="container-x flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="heading text-4xl md:text-5xl">See you at the track</h2>
            <p className="mt-2 text-white/80">Look for the PARX Open merch tent near the spectator area. Cash and e-wallet payment details will be confirmed per venue.</p>
          </div>
          <NextLegLink variant="red" />
        </div>
      </section>
    </>
  );
}
