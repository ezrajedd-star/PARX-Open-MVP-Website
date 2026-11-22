import Link from "next/link";
import { notFound } from "next/navigation";
import { ClassificationTable } from "@/components/results/ClassificationTable";
import { ResultsShell } from "@/components/results/ResultsShell";
import { podiumClass } from "@/components/results/podium";
import { LinkButton } from "@/components/ui/Button";
import { ShareButtons } from "@/components/news/ShareButtons";
import { getLegsWithStatus } from "@/lib/data";
import { formatLegDates } from "@/lib/format";
import { classRowsForLeg } from "@/lib/results-view";
import { absUrl, pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ leg: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => getLegsWithStatus().map((l) => ({ leg: l.slug }));

export async function generateMetadata({ params }: Props) {
  const { leg: slug } = await params;
  const l = getLegsWithStatus().find((x) => x.slug === slug);
  if (!l) return {};
  return pageMeta({ title: `Results: Round ${l.round} ${l.name}`, description: `Final classification and stage times from PARX Open Round ${l.round}, ${l.name}, ${l.province}.`, path: `/results/${l.slug}` });
}

export default async function LegResultsPage({ params }: Props) {
  const { leg: slug } = await params;
  const leg = getLegsWithStatus().find((l) => l.slug === slug);
  if (!leg) notFound();
  const res = classRowsForLeg(slug);

  return (
    <ResultsShell sample={!!res?.sample}>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow text-red">
            Round {leg.round} · {leg.islandGroup} · {formatLegDates(leg.dates)}
          </p>
          <h2 className="heading mt-1 text-5xl text-navy">
            <Link href={`/calendar/${leg.slug}`} className="hover:text-red">
              {leg.name}
            </Link>
          </h2>
        </div>
        {res && <ShareButtons url={absUrl(`/results/${leg.slug}`)} title={`PARX Open Round ${leg.round} ${leg.name} — results`} compact />}
      </div>

      {res && res.rows.length ? (
        <>
          <ol className="mb-6 grid grid-cols-3 items-end gap-2" aria-label="Podium">
            {[1, 0, 2].map((i) => {
              const r = res.rows.filter((x) => x.position)[i];
              if (!r) return <li key={i} />;
              return (
                <li key={r.driverSlug} className={`flex min-w-0 flex-col items-center justify-end bg-white p-2 text-center ring-1 ring-navy/10 ${i === 0 ? "pb-6 pt-4" : i === 1 ? "pb-4" : "pb-3"}`}>
                  <span className={`grid h-10 w-10 place-items-center font-display text-2xl font-extrabold italic ${podiumClass(r.position)}`}>{r.position}</span>
                  <Link href={`/drivers/${r.driverSlug}`} className="heading mt-2 text-xl text-navy hover:text-red sm:text-3xl">
                    {r.driverName}
                  </Link>
                  <span className="block w-full truncate text-[11px] text-ink/65 sm:text-xs">{r.teamName}</span>
                  <span className="mt-1 text-xs font-semibold tabular">{r.position === 1 ? r.total : r.gap}</span>
                </li>
              );
            })}
          </ol>
          <ClassificationTable rows={res.rows} caption={`Round ${leg.round} ${leg.name} — final classification`} />
        </>
      ) : (
        <div className="bg-white p-8 text-center ring-1 ring-navy/10">
          <p className="heading text-3xl text-navy">No results yet</p>
          <p className="mt-2 text-ink/70">Results for {leg.name} will be published here after the awarding ceremony.</p>
          <LinkButton href={`/calendar/${leg.slug}`} variant="dark" className="mt-5" arrow>
            Event details
          </LinkButton>
        </div>
      )}
    </ResultsShell>
  );
}
