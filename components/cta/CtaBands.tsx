import Link from "next/link";
import { getCompete } from "@/lib/content";
import { LinkButton } from "../ui/Button";
import { ArrowRight } from "../ui/Icons";

/** "Join as a driver" band with the three entry paths. */
export function DriverCtaBand({ eyebrow = "Race with us", title = "Join as a driver", compact = false }: { eyebrow?: string; title?: string; compact?: boolean }) {
  const c = getCompete();
  return (
    <section aria-labelledby="driver-cta-h" className="relative isolate overflow-hidden bg-gold text-navy">
      <div className="absolute -right-16 top-0 hidden h-full w-48 -skew-x-[24deg] bg-red md:block" aria-hidden />
      <div className="absolute right-36 top-0 hidden h-full w-6 -skew-x-[24deg] bg-white/60 md:block" aria-hidden />
      <div className={`container-x relative ${compact ? "py-10" : "py-12 md:py-16"}`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">{eyebrow}</p>
            <h2 id="driver-cta-h" className="heading mt-2 text-5xl md:text-6xl">
              {title}
            </h2>
            <p className="mt-3 text-lg">Never raced? Start with the Rally Fundamentals, taught by {c.instructor.title} {c.instructor.name}. Got experience but no car? Arrive and drive. Got a car? Line up.</p>
          </div>
          <LinkButton href="/drive#register" variant="dark" size="lg" arrow className="shrink-0 lg:mr-40">
            Join as a driver
          </LinkButton>
        </div>
        {!compact && (
          <ol className="mt-8 grid gap-2 md:grid-cols-3 lg:mr-40">
            {c.paths.map((p, i) => (
              <li key={p.id}>
                <Link href={`/drive#${p.id}`} className="group flex h-full items-start gap-3 bg-white p-4 ring-1 ring-navy/10 transition hover:ring-navy">
                  <span className="heading text-4xl text-red tabular">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0">
                    <span className="heading block text-2xl">{p.name}</span>
                    <span className="block text-sm text-ink/75">{p.tag} · {p.summary}</span>
                  </span>
                  <ArrowRight className="ml-auto mt-1 shrink-0 transition group-hover:translate-x-1" aria-hidden />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

/** "Want us in your city? Let's talk." */
export function HostCtaBand({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const dark = tone === "dark";
  return (
    <section aria-labelledby="host-cta-h" className={`relative overflow-hidden ${dark ? "bg-navy-deep text-white" : "bg-white text-navy"}`}>
      <div className="speed-lines absolute inset-0" aria-hidden />
      <div className="container-x relative flex flex-col gap-5 py-10 md:flex-row md:items-center md:justify-between md:py-12">
        <div>
          <p className={`eyebrow ${dark ? "text-gold" : "text-red"}`}>More cities, more legs</p>
          <h2 id="host-cta-h" className="heading mt-2 text-4xl md:text-5xl">
            Want us in your city? Let&apos;s talk.
          </h2>
        </div>
        <LinkButton href="/host" variant={dark ? "light" : "dark"} size="lg" arrow className="shrink-0">
          Host a leg
        </LinkButton>
      </div>
    </section>
  );
}
