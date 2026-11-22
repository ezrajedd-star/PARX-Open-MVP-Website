import Link from "next/link";
import type { StandingRow } from "@/lib/standings";
import { MinusIcon, TriangleDown, TriangleUp } from "../ui/Icons";
import { podiumBorder, podiumClass } from "./podium";

export interface StandingEntity {
  id: string;
  name: string;
  sub: string;
  color: string;
  href: string;
}

function Movement({ m }: { m: number | null }) {
  if (m == null) return <span className="sr-only">No previous round</span>;
  if (m > 0)
    return (
      <span className="flex items-center text-[11px] font-bold text-green-700" title={`Up ${m}`}>
        <TriangleUp width={9} height={9} />
        {m}
        <span className="sr-only"> place{m > 1 ? "s" : ""} up</span>
      </span>
    );
  if (m < 0)
    return (
      <span className="flex items-center text-[11px] font-bold text-red" title={`Down ${-m}`}>
        <TriangleDown width={9} height={9} />
        {-m}
        <span className="sr-only"> place{m < -1 ? "s" : ""} down</span>
      </span>
    );
  return (
    <span className="text-ink/40" title="No change">
      <MinusIcon width={12} height={12} />
      <span className="sr-only">No change</span>
    </span>
  );
}

/**
 * Championship table. Mobile: driver column sticks left, total sticks right,
 * round columns scroll horizontally between them.
 */
export function StandingsTable({
  rows,
  entities,
  legs,
  caption,
  kind,
}: {
  rows: StandingRow[];
  entities: Map<string, StandingEntity>;
  legs: { slug: string; round: number; name: string }[];
  caption: string;
  kind: "Driver" | "Team";
}) {
  return (
    <div className="relative overflow-x-auto bg-white ring-1 ring-navy/10" tabIndex={0} role="region" aria-label={`${caption} (scrolls horizontally)`}>
      <table className="w-full min-w-[560px] border-separate border-spacing-0 text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="font-display text-xs font-bold uppercase tracking-wider text-white">
          <tr>
            <th scope="col" className="sticky left-0 z-20 bg-navy py-2.5 pl-1.5 pr-2 sm:pl-2">
              <span className="inline-block w-9 text-center sm:w-12">Pos</span> {kind}
            </th>
            {kind === "Driver" && <th scope="col" className="hidden bg-navy px-2 py-2.5 lg:table-cell">Team</th>}
            {legs.map((l) => (
              <th key={l.slug} scope="col" className="min-w-14 bg-navy px-2 py-2.5 text-center">
                <Link href={`/results/${l.slug}`} className="hover:text-gold" title={`Round ${l.round} — ${l.name}`}>
                  R{l.round}
                  <span className="block text-[10px] font-semibold normal-case tracking-normal text-white/65">{l.name}</span>
                </Link>
              </th>
            ))}
            <th scope="col" className="sticky right-0 z-20 bg-red px-2 py-2.5 text-right sm:px-3">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const e = entities.get(r.id)!;
            const top = r.position <= 3;
            return (
              <tr key={r.id} className="group">
                <th scope="row" className="sticky left-0 z-10 border-t border-r border-navy/10 bg-white py-2 pl-1.5 pr-2 font-normal sm:pl-2 group-hover:bg-dust" style={{ boxShadow: top ? `inset 4px 0 0 ${podiumBorder(r.position)}` : undefined }}>
                  <div className="flex items-center gap-2">
                    <div className="flex w-9 shrink-0 flex-col items-center sm:w-12">
                      <span className={`grid h-8 w-9 place-items-center font-display text-lg font-extrabold italic tabular ${podiumClass(r.position)}`}>{r.position}</span>
                      <Movement m={r.movement} />
                    </div>
                    <span className="h-7 w-1 shrink-0 -skew-x-12" style={{ background: e.color }} aria-hidden />
                    <div className="w-[6.25rem] min-w-0 sm:w-auto sm:max-w-none">
                      <Link href={e.href} className="block truncate font-display text-base font-bold uppercase italic leading-tight text-navy hover:text-red">
                        {e.name}
                      </Link>
                      {e.sub && <span className={`block truncate text-xs text-ink/65 ${kind === "Driver" ? "lg:hidden" : ""}`}>{e.sub}</span>}
                    </div>
                  </div>
                </th>
                {kind === "Driver" && <td className="hidden border-t border-navy/10 px-2 py-2 text-ink/75 group-hover:bg-dust lg:table-cell">{e.sub}</td>}
                {legs.map((l) => {
                  const c = r.perLeg[l.slug];
                  return (
                    <td key={l.slug} className="border-t border-navy/10 px-2 py-2 text-center tabular group-hover:bg-dust">
                      {c ? (
                        <span className="flex flex-col items-center leading-tight">
                          <span className="font-semibold text-navy">{c.points}</span>
                          <span className="text-[10px] text-ink/60">{c.status === "FIN" ? (kind === "Team" ? `best P${c.position}` : `P${c.position}`) : c.status}</span>
                        </span>
                      ) : (
                        <span className="text-ink/30" aria-label="No result">–</span>
                      )}
                    </td>
                  );
                })}
                <td className="sticky right-0 z-10 border-t border-l border-navy/10 bg-white px-2 py-2 sm:px-3 text-right font-display text-xl font-extrabold italic tabular text-navy group-hover:bg-dust">{r.total}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
