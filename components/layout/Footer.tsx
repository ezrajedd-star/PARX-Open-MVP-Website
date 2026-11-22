import Image from "next/image";
import Link from "next/link";
import { getSite } from "@/lib/content";
import { SponsorWall } from "../sponsors/SponsorWall";
import { socialIcon } from "../ui/Icons";

export function Footer() {
  const site = getSite();
  const year = new Date().getFullYear();
  return (
    <footer className="dust-texture relative bg-navy-deep text-white">
      <div className="livery w-full" aria-hidden />
      <section aria-labelledby="footer-partners" className="container-x py-12 md:py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 id="footer-partners" className="heading text-3xl md:text-4xl">
            Official partners
          </h2>
        </div>
        <SponsorWall tone="dark" />
      </section>

      <div className="border-t border-white/10">
        <div className="container-x grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Image src={site.logo} alt={site.logoAlt} width={200} height={57} unoptimized className="h-12 w-auto" />
            <p className="mt-4 max-w-sm text-sm text-white/70">{site.fullName}. Rallycross racing across the Visayas and Mindanao.</p>
            {site.accreditation && <p className="mt-4 text-sm text-white/70">Organised under {site.accreditation}</p>}
          </div>
          <nav aria-label="Footer">
            <h2 className="eyebrow mb-3 text-gold">Explore</h2>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm md:grid-cols-1">
              {site.nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="text-white/80 hover:text-white hover:underline">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="eyebrow mb-3 text-gold">Follow &amp; contact</h2>
            <ul className="flex flex-wrap gap-2">
              {site.social.map((s) => {
                const Icon = socialIcon[s.platform];
                return (
                  <li key={s.platform}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${site.name} on ${s.label}`}
                      className={`grid h-11 place-items-center ${s.platform === "facebook" ? "bg-[#0B57D0] px-4 hover:bg-[#0846a8]" : "w-11 bg-white/10 hover:bg-white/20"}`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon />
                        {s.platform === "facebook" && <span className="font-display font-bold uppercase italic">Facebook</span>}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
            <p className="mt-5 text-sm">
              <span className="text-white/60">Email: </span>
              <a href={`mailto:${site.contactEmail}`} className="font-semibold text-white underline-offset-2 hover:underline">
                {site.contactEmail}
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-white/60 md:flex-row md:justify-between">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <p>{site.accreditation ? `Organised under ${site.accreditation}` : "Organised under —"}</p>
        </div>
      </div>
    </footer>
  );
}
