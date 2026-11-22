"use client";
import Link from "next/link";
import { Fragment, useState } from "react";
import { ChevronDown } from "../ui/Icons";

export interface ClassRow {
  driverSlug: string;
  driverName: string;
  teamName: string;
  teamColor: string;
  position: number | null;
  status: "FIN" | "DNF" | "DNS" | "DSQ";
  total: string;
  gap: string;
  points: number;
  stages: string[];
  stageBest: boolean[];
  className: string | null;
}

const STATUS_TITLE = { DNF: "Did not finish", DNS: "Did not start", DSQ: "Disqualified", FIN: "Finished" } as const;

function Pos({ r }: { r: ClassRow }) {
  if (r.status !== "FIN")
    return (
      <abbr title={STATUS_TITLE[r.status]} className="inline-grid h-8 min-w-10 place-items-center bg-red/10 px-1 font-display text-sm font-extrabold italic text-red no-underline">
        {r.status}
      </abbr>
    );
  const pod = r.position === 1 ? "bg-gold text-navy" : r.position === 2 ? "bg-silver text-navy" : r.position === 3 ? "bg-bronze text-navy" : "bg-navy/5 text-navy";
  return <span className={`inline-grid h-8 w-10 place-items-center font-display text-lg font-extrabold italic tabular ${pod}`}>{r.position}</span>;
}

/** Final classification with expandable SS1–SS8 stage times per row. */
export function ClassificationTable({ rows, limit, caption }: { rows: ClassRow[]; limit?: number; caption: string }) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [allOpen, setAllOpen] = useState(false);
  const shown = limit ? rows.slice(0, limit) : rows;
  const toggle = (s: string) =>
    setOpen((o) => {
      const n = new Set(o);
      if (n.has(s)) n.delete(s);
      else n.add(s);
      return n;
    });
  const isOpen = (s: string) => allOpen || open.has(s);
  const hasClasses = rows.some((r) => r.className);

  return (
    <div>
      {!limit && (
        <div className="mb-2 flex justify-end">
          <button type="button" onClick={() => setAllOpen((v) => !v)} aria-pressed={allOpen} className="font-display text-sm font-bold uppercase italic tracking-wide text-navy underline-offset-2 hover:underline">
            {allOpen ? "Hide all stage times" : "Show all stage times"}
          </button>
        </div>
      )}
      <div className="overflow-hidden bg-white ring-1 ring-navy/10">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-navy font-display text-xs font-bold uppercase tracking-wider text-white">
            <tr>
              <th scope="col" className="w-12 px-1 py-2.5 text-center sm:w-16 sm:px-2">Pos</th>
              <th scope="col" className="px-2 py-2.5">Driver</th>
              <th scope="col" className="hidden px-2 py-2.5 text-right sm:table-cell">Total time</th>
              <th scope="col" className="px-2 py-2.5 text-right">
                <span className="sm:hidden">Time / Gap</span>
                <span className="hidden sm:inline">Gap</span>
              </th>
              <th scope="col" className="w-10 px-1 py-2.5 text-right sm:px-2">Pts</th>
              <th scope="col" className="w-10 px-0 py-2.5">
                <span className="sr-only">Stage times</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => {
              const id = `st-${r.driverSlug}`;
              const o = isOpen(r.driverSlug);
              return (
                <Fragment key={r.driverSlug}>
                  <tr className={`border-t border-navy/10 ${o ? "bg-dust/50" : "hover:bg-dust/30"}`}>
                    <td className="px-1 py-2 text-center sm:px-2">
                      <Pos r={r} />
                    </td>
                    <td className="w-full max-w-0 px-2 py-2">
                      <div className="flex items-center gap-2">
                        <span className="h-7 w-1 shrink-0 -skew-x-12" style={{ background: r.teamColor }} aria-hidden />
                        <div className="min-w-0">
                          <Link href={`/drivers/${r.driverSlug}`} className="block truncate font-display text-base font-bold uppercase italic leading-tight text-navy hover:text-red">
                            {r.driverName}
                          </Link>
                          <span className="block truncate text-xs text-ink/65">
                            {r.teamName}
                            {hasClasses && r.className ? ` · ${r.className}` : ""}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-2 py-2 text-right font-semibold tabular sm:table-cell">{r.total}</td>
                    <td className="whitespace-nowrap px-1 py-2 text-right tabular sm:px-2">
                      <span className="block font-semibold sm:hidden">{r.position === 1 ? r.total : r.gap}</span>
                      <span className="hidden text-ink/80 sm:inline">{r.gap}</span>
                    </td>
                    <td className="px-1 py-2 text-right font-display text-lg sm:px-2 font-extrabold italic tabular text-navy">{r.points}</td>
                    <td className="px-0 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => toggle(r.driverSlug)}
                        aria-expanded={o}
                        aria-controls={id}
                        className="grid h-9 w-9 place-items-center text-navy hover:bg-navy/10"
                      >
                        <ChevronDown className={`transition-transform ${o ? "rotate-180" : ""}`} />
                        <span className="sr-only">{o ? "Hide" : "Show"} stage times for {r.driverName}</span>
                      </button>
                    </td>
                  </tr>
                  <tr id={id} hidden={!o} className="bg-dust/50">
                    <td colSpan={6} className="px-2 pb-3 pt-0 sm:px-4">
                      <ol className="grid grid-cols-4 gap-1 sm:grid-cols-8">
                        {r.stages.map((t, i) => (
                          <li key={i} className={`px-1.5 py-1 text-center ${r.stageBest[i] ? "bg-gold text-navy" : "bg-white"}`}>
                            <span className="block font-display text-[11px] font-bold uppercase tracking-wider text-ink/60">SS{i + 1}</span>
                            <span className="block text-xs font-semibold tabular">{t}</span>
                            {r.stageBest[i] && <span className="sr-only">(fastest)</span>}
                          </li>
                        ))}
                      </ol>
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 flex items-center gap-2 text-xs text-ink/65">
        <span className="inline-block h-3 w-3 bg-gold" aria-hidden /> Fastest time on the stage · DNF did not finish · DNS did not start · DSQ disqualified
      </p>
    </div>
  );
}
