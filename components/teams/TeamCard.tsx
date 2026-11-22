import Link from "next/link";
import type { Team } from "@/lib/types";
import { ArrowRight } from "../ui/Icons";
import { Photo } from "../ui/Photo";
import { DriverAvatar } from "./DriverAvatar";

export function TeamCard({ team, className = "" }: { team: Team; className?: string }) {
  const shown = team.drivers.slice(0, 5);
  const more = team.drivers.length - shown.length;
  return (
    <article className={`group relative flex flex-col overflow-hidden bg-white ring-1 ring-navy/10 transition hover:shadow-xl ${className}`}>
      <div className="relative h-28 overflow-hidden" style={{ background: team.colors.primary }}>
        <div className="absolute inset-0 speed-lines" aria-hidden />
        <div className="absolute -right-6 top-0 h-full w-1/2 -skew-x-[24deg]" style={{ background: team.colors.secondary, opacity: 0.9 }} aria-hidden />
        <div className="absolute -right-2 top-0 h-full w-6 -skew-x-[24deg] bg-white/40" aria-hidden />
        <Photo
          src={team.logo}
          alt={`${team.name} logo`}
          kind="team"
          placeholderLabel={team.name}
          className="absolute bottom-3 left-4 h-16 w-16 ring-4 ring-white"
          tone="navy"
          showLabel={false}
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="heading text-[1.9rem] text-navy">
          <Link href={`/teams/${team.slug}`} className="after:absolute after:inset-0 group-hover:text-red">
            {team.name}
          </Link>
        </h3>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="eyebrow text-[11px] text-ink/60">Team principal</dt>
            <dd className="font-semibold text-navy">{team.principal ?? "—"}</dd>
          </div>
          <div>
            <dt className="eyebrow text-[11px] text-ink/60">Drivers</dt>
            <dd className="font-semibold text-navy tabular">{team.drivers.length}</dd>
          </div>
        </dl>
        <div className="mt-4 flex items-center justify-between">
          <ul className="flex -space-x-2" aria-label={`${team.name} drivers`}>
            {shown.map((d) => (
              <li key={d.slug} title={d.displayName}>
                <DriverAvatar slug={d.slug} name={d.displayName} className="h-10 w-10 rounded-full ring-2 ring-white" accent={team.colors.primary} />
              </li>
            ))}
            {more > 0 && (
              <li className="grid h-10 w-10 place-items-center rounded-full bg-navy text-xs font-bold text-white ring-2 ring-white">+{more}</li>
            )}
          </ul>
          <ArrowRight className="text-navy transition group-hover:translate-x-1 group-hover:text-red" aria-hidden />
        </div>
      </div>
    </article>
  );
}
