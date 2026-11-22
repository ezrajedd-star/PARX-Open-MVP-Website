"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function ResultsNav({ legs, defaultLeg }: { legs: { slug: string; label: string; hasResults: boolean }[]; defaultLeg: string }) {
  const path = usePathname();
  const router = useRouter();
  const currentLeg = legs.find((l) => path === `/results/${l.slug}`)?.slug;
  const tabs = [
    { href: "/results", label: "Drivers", long: "Driver Standings", active: path === "/results" },
    { href: "/results/teams", label: "Teams", long: "Team Standings", active: path === "/results/teams" },
    { href: `/results/${currentLeg ?? defaultLeg}`, label: "By Leg", long: "Results by Leg", active: !!currentLeg },
  ];
  return (
    <div className="sticky top-14 z-30 border-b border-navy/10 bg-white/95 backdrop-blur">
      <div className="container-x flex flex-col gap-2 py-2 md:flex-row md:items-center md:justify-between">
        <nav aria-label="Results sections">
          <ul className="grid grid-cols-3 gap-1 md:flex">
            {tabs.map((t) => (
              <li key={t.label}>
                <Link
                  href={t.href}
                  aria-current={t.active ? "page" : undefined}
                  className={`flex h-11 items-center justify-center px-3 font-display text-base font-bold uppercase italic tracking-wide md:px-5 ${
                    t.active ? "bg-navy text-white" : "bg-dust text-navy hover:bg-dust-dark"
                  }`}
                >
                  <span className="md:hidden">{t.label}</span>
                  <span className="hidden md:inline">{t.long}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {currentLeg && (
          <label className="flex items-center gap-2">
            <span className="eyebrow shrink-0 text-ink/65">Leg</span>
            <select
              value={currentLeg}
              onChange={(e) => router.push(`/results/${e.target.value}`)}
              className="h-11 w-full border-2 border-navy bg-white px-3 font-display text-base font-bold uppercase text-navy md:w-72"
            >
              {legs.map((l) => (
                <option key={l.slug} value={l.slug}>
                  {l.label}
                  {l.hasResults ? "" : " — no results yet"}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}
