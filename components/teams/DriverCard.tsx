import Link from "next/link";
import { photo } from "@/lib/content";
import type { Driver } from "@/lib/types";
import { Photo } from "../ui/Photo";
import { DriverAvatar } from "./DriverAvatar";

/** Roster card: driver headshot + car photo slot. */
export function DriverCard({ d, accent }: { d: Driver; accent: string }) {
  return (
    <article className="group relative flex flex-col overflow-hidden bg-white ring-1 ring-navy/10 transition hover:shadow-lg">
      <div className="relative">
        <DriverAvatar slug={d.slug} name={d.displayName} className="aspect-[4/5] w-full" accent={accent} sizes="(min-width:1024px) 20vw, (min-width:640px) 33vw, 50vw" />
        {d.number != null && <span className="heading absolute right-2 top-2 text-4xl text-white/90 tabular">#{d.number}</span>}
        {d.isPrincipal && <span className="absolute left-3 top-2 bg-gold px-1.5 py-0.5 font-display text-[10px] font-extrabold uppercase italic tracking-wider text-navy">Team principal</span>}
      </div>
      <div className="flex items-stretch">
        <span className="w-1.5 shrink-0" style={{ background: accent }} aria-hidden />
        <div className="min-w-0 flex-1 p-3">
          <h3 className="heading truncate text-2xl text-navy">
            <Link href={`/drivers/${d.slug}`} className="after:absolute after:inset-0 group-hover:text-red">
              {d.displayName}
            </Link>
          </h3>
          <p className="truncate text-xs text-ink/65">{d.car ?? "Car TBA"}</p>
        </div>
      </div>
      <Photo src={photo("cars", d.slug)} alt={`${d.displayName}'s car`} kind="car" className="aspect-[16/7]" sizes="(min-width:1024px) 20vw, 50vw" accent={accent} placeholderLabel="Car" />
    </article>
  );
}
