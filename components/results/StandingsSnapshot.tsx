import Link from "next/link";
import { driverMap, getChampionship, teamMap } from "@/lib/data";
import { ArrowRight } from "../ui/Icons";
import { SampleBadge } from "../ui/Section";
import { DriverAvatar } from "../teams/DriverAvatar";
import { podiumClass } from "./podium";

export function StandingsSnapshot() {
  const { drivers, teams, hasSample, hasAnyResults } = getChampionship();
  const dm = driverMap();
  const tm = teamMap();
  if (!hasAnyResults)
    return <p className="text-white/80">Standings will appear here after Round 1.</p>;
  return (
    <div>
      {hasSample && <SampleBadge className="mb-4 !text-gold" />}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h3 className="eyebrow mb-2 text-white/70">Drivers — top 5</h3>
          <ol className="divide-y divide-white/10 bg-white/[.04] ring-1 ring-white/10">
            {drivers.slice(0, 5).map((r) => {
              const d = dm.get(r.id)!;
              const t = tm.get(d.teamSlug)!;
              return (
                <li key={r.id}>
                  <Link href={`/drivers/${d.slug}`} className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5">
                    <span className={`grid h-9 w-9 shrink-0 place-items-center font-display text-xl font-extrabold italic tabular ${podiumClass(r.position, "dark")}`}>{r.position}</span>
                    <DriverAvatar slug={d.slug} name={d.displayName} className="h-10 w-10 shrink-0" accent={t.colors.primary} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-lg font-bold uppercase italic leading-tight">{d.displayName}</span>
                      <span className="flex items-center gap-1.5 truncate text-xs text-white/65">
                        <span className="h-2.5 w-1 -skew-x-12" style={{ background: t.colors.primary }} aria-hidden />
                        {t.name}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block font-display text-2xl font-extrabold italic leading-none tabular">{r.total}</span>
                      <span className="text-[10px] uppercase tracking-widest text-white/60">pts</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
        <div>
          <h3 className="eyebrow mb-2 text-white/70">Teams — top 3</h3>
          <ol className="space-y-2">
            {teams.slice(0, 3).map((r) => {
              const t = tm.get(r.id)!;
              return (
                <li key={r.id}>
                  <Link href={`/teams/${t.slug}`} className="relative flex items-center gap-3 overflow-hidden bg-white/[.04] px-3 py-3 ring-1 ring-white/10 hover:bg-white/10">
                    <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: t.colors.primary }} aria-hidden />
                    <span className={`ml-1 grid h-9 w-9 shrink-0 place-items-center font-display text-xl font-extrabold italic tabular ${podiumClass(r.position, "dark")}`}>{r.position}</span>
                    <span className="min-w-0 flex-1 truncate font-display text-lg font-bold uppercase italic">{t.name}</span>
                    <span className="font-display text-2xl font-extrabold italic tabular">{r.total}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
          <Link href="/results" className="mt-4 inline-flex items-center gap-1.5 font-display font-bold uppercase italic text-gold hover:underline">
            Full standings <ArrowRight width={18} height={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
