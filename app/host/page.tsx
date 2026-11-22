import { LeadForm } from "@/components/forms/LeadForm";
import { FootprintMap } from "@/components/map/FootprintMap";
import { LinkButton } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";
import { SectionHeading } from "@/components/ui/Section";
import { getHost, getLegs, getSite } from "@/lib/content";
import { FORM_ENDPOINTS } from "@/lib/forms";
import { pageMeta } from "@/lib/seo";

export const generateMetadata = () =>
  pageMeta({ title: "Host a Leg", description: "Want PARX Open in your city? Bring a full rallycross race weekend to your city or province. Let's talk.", path: "/host" });

export default function HostPage() {
  const site = getSite();
  const h = getHost();
  const legs = getLegs();
  return (
    <>
      <section className="dust-texture relative isolate overflow-hidden bg-navy text-white">
        <div className="speed-lines absolute inset-0" aria-hidden />
        <div className="container-x relative grid items-center gap-8 py-12 md:py-20 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="eyebrow text-gold">{h.hero.eyebrow}</p>
            <h1 className="heading mt-3 text-[3.4rem] sm:text-7xl md:text-8xl">{h.hero.title}</h1>
            <p className="mt-5 max-w-xl text-lg text-white/85">{h.hero.subtitle}</p>
            <div className="livery mt-8 w-56" aria-hidden />
            <LinkButton href="#talk" variant="red" size="lg" className="mt-8" arrow>
              Start the conversation
            </LinkButton>
          </div>
          <div className="mx-auto w-full max-w-md lg:max-w-none">
            <FootprintMap legs={legs} />
          </div>
        </div>
      </section>

      <section aria-labelledby="why-h" className="bg-dust py-12 md:py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Why host" title={<span id="why-h">What a leg brings to your city</span>} />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {h.benefits.map((b, i) => (
              <li key={b.title} className="bg-white p-5 ring-1 ring-navy/10">
                <span className="heading text-4xl text-red tabular">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="heading mt-2 text-2xl text-navy">{b.title}</h3>
                <p className="mt-1 text-[15px] text-ink/75">{b.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="talk" aria-labelledby="talk-h" className="scroll-mt-32 py-12 md:py-20">
        <div className="container-x grid gap-8 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <SectionHeading eyebrow="Let's talk" title={<span id="talk-h">Bring PARX Open to your city</span>} />
            <h3 className="eyebrow mb-3 text-navy">What we look for</h3>
            <ul className="space-y-2">
              {h.lookingFor.map((t) => (
                <li key={t} className="flex gap-2 text-ink/80">
                  <CheckIcon width={18} height={18} className="mt-1 shrink-0 text-red" />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-ink/75">
              Prefer email? <a href={`mailto:${site.contactEmail}`} className="font-semibold text-red underline underline-offset-2">{site.contactEmail}</a>
            </p>
          </div>
          <div className="bg-navy p-1">
            <LeadForm
              formType="host-city"
              endpoint={FORM_ENDPOINTS.host}
              email={site.contactEmail}
              subject={`${site.name} host city inquiry — {city}`}
              submitLabel="Send"
              successText="Thanks! We'll be in touch to talk about bringing PARX Open to your city."
              fields={[
                { name: "name", label: "Your name", type: "text", required: true, autoComplete: "name" },
                { name: "organisation", label: "Organisation / LGU", type: "text", required: true, autoComplete: "organization" },
                { name: "role", label: "Your role", type: "text", autoComplete: "organization-title" },
                { name: "city", label: "City / province", type: "text", required: true },
                { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
                { name: "mobile", label: "Mobile", type: "tel", autoComplete: "tel", placeholder: "+63" },
                { name: "venue", label: "Possible venue", type: "text", wide: true, placeholder: "e.g. open field, quarry, motor park" },
                { name: "message", label: "Message", type: "textarea", placeholder: "Tell us about your city and timing." },
              ]}
            />
          </div>
        </div>
      </section>
    </>
  );
}
