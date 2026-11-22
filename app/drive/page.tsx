import { LeadForm } from "@/components/forms/LeadForm";
import { LinkButton } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";
import { Photo } from "@/components/ui/Photo";
import { SampleBadge, SectionHeading } from "@/components/ui/Section";
import { getCompete, getLegs, getSite } from "@/lib/content";
import { formatPeso } from "@/lib/format";
import { FORM_ENDPOINTS } from "@/lib/forms";
import { JsonLd, absUrl, pageMeta } from "@/lib/seo";

export const generateMetadata = () =>
  pageMeta({
    title: "Join as a Driver",
    description: "Race in PARX Open. Start with the Rally Fundamentals course by 10x National Rally Champion Vip Isada, Arrive and Drive in a shared car, or enter with your own rally car.",
    path: "/drive",
  });

export default function DrivePage() {
  const site = getSite();
  const c = getCompete();
  const legs = getLegs();
  const rf = c.paths.find((p) => p.id === "rally-fundamentals");

  return (
    <>
      {rf && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Course",
            name: `${site.name} ${rf.name}`,
            description: `${rf.summary} ${rf.points.join(". ")}.`,
            url: absUrl("/drive"),
            provider: { "@type": "SportsOrganization", name: site.name, url: absUrl("/") },
            instructor: { "@type": "Person", name: c.instructor.name, description: c.instructor.title },
          }}
        />
      )}

      {/* Hero */}
      <section className="dust-texture relative isolate overflow-hidden bg-navy text-white">
        <div className="speed-lines absolute inset-0" aria-hidden />
        <div className="absolute -right-24 top-0 h-full w-3/4 -skew-x-[24deg] bg-gradient-to-l from-gold/30 to-transparent md:w-1/2" aria-hidden />
        <div className="absolute right-[14%] top-0 hidden h-full w-8 -skew-x-[24deg] bg-red md:block" aria-hidden />
        <div className="container-x relative py-14 md:py-24">
          <p className="eyebrow text-gold">{c.hero.eyebrow}</p>
          <h1 className="heading mt-3 max-w-4xl text-[3.4rem] sm:text-7xl md:text-8xl">{c.hero.title}</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/85">{c.hero.subtitle}</p>
          <div className="livery mt-8 w-56" aria-hidden />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="#register" variant="gold" size="lg" arrow>
              Register your interest
            </LinkButton>
            <LinkButton href="/calendar" variant="ghost-light" size="lg">
              See the calendar
            </LinkButton>
          </div>
        </div>
      </section>

      {/* Three paths */}
      <section aria-labelledby="paths-h" className="bg-dust py-12 md:py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Three ways in" title={<span id="paths-h">Choose your path</span>} />
          <ol className="grid gap-4 lg:grid-cols-3">
            {c.paths.map((p, i) => (
              <li key={p.id} id={p.id} className={`relative flex scroll-mt-40 flex-col overflow-hidden p-5 ring-1 md:p-6 ${i === 0 ? "bg-navy text-white ring-navy" : "bg-white text-navy ring-navy/15"}`}>
                <span className={`absolute inset-x-0 top-0 h-1.5 ${i === 0 ? "bg-gold" : i === 1 ? "bg-red" : "bg-navy"}`} aria-hidden />
                <div className="flex items-start justify-between gap-3">
                  <span className={`heading text-6xl tabular ${i === 0 ? "text-gold" : "text-red"}`}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={`mt-2 px-2 py-0.5 font-display text-xs font-extrabold uppercase italic tracking-wider ${i === 0 ? "bg-gold text-navy" : "bg-navy text-white"}`}>{p.tag}</span>
                </div>
                <h3 className="heading mt-3 text-4xl">{p.name}</h3>
                <p className={`mt-2 text-lg font-semibold ${i === 0 ? "text-white" : "text-navy"}`}>{p.summary}</p>
                <ul className="mt-4 space-y-2">
                  {p.points.map((pt) => (
                    <li key={pt} className={`flex gap-2 text-[15px] ${i === 0 ? "text-white/85" : "text-ink/80"}`}>
                      <CheckIcon width={18} height={18} className={`mt-0.5 shrink-0 ${i === 0 ? "text-gold" : "text-red"}`} />
                      {pt}
                    </li>
                  ))}
                </ul>
                {p.motto && <p className={`heading mt-5 text-3xl ${i === 0 ? "text-gold" : "text-red"}`}>{p.motto}</p>}
                <div className="mt-auto pt-6">
                  <p className={`mb-3 font-display text-lg font-bold uppercase italic ${i === 0 ? "text-white/80" : "text-ink/70"}`}>{p.price != null ? `${formatPeso(p.price)} per leg` : "Package details: TBA"}</p>
                  <LinkButton href={`#register-${p.id}`} variant={i === 0 ? "gold" : "red"} className="w-full" arrow>
                    {p.cta}
                  </LinkButton>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-ink/75">
            <SampleBadge label="To be confirmed" />
            {c.packageNote}
          </p>
        </div>
      </section>

      {/* Instructor */}
      <section aria-labelledby="coach-h" className="py-12 md:py-20">
        <div className="container-x grid items-center gap-8 md:grid-cols-[minmax(0,340px)_1fr]">
          <Photo src={c.instructor.photo} alt={c.instructor.name} kind="driver" className="aspect-[4/5] w-full max-w-[300px] md:max-w-none" placeholderLabel="Instructor photo" sizes="340px" />
          <div>
            <p className="eyebrow text-red">Rally Fundamentals · your instructor</p>
            <h2 id="coach-h" className="heading mt-2 text-6xl text-navy md:text-7xl">
              {c.instructor.name}
            </h2>
            <p className="heading mt-1 text-3xl text-gold [text-shadow:0_1px_0_rgb(11_31_75/.25)]">{c.instructor.title}</p>
            <div className="livery mt-5 w-40" aria-hidden />
            <p className="mt-5 max-w-xl text-lg text-ink/80">
              Learn from a champion before you race. The Rally Fundamentals runs on the Friday of each race weekend in two parts — a lecture, then a practical session in the car — so you line up on Saturday with the proper instruction and guidance.
            </p>
            <LinkButton href="#register-rally-fundamentals" variant="dark" className="mt-6" arrow>
              Join the Rally Fundamentals
            </LinkButton>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-h" className="bg-dust py-12 md:py-16">
        <div className="container-x">
          <SectionHeading eyebrow="How it works" title={<span id="how-h">From sign-up to start line</span>} />
          <ol className="grid gap-3 md:grid-cols-3">
            {c.steps.map((s, i) => (
              <li key={s.title} className="bg-white p-5 ring-1 ring-navy/10">
                <span className="heading text-4xl text-red tabular">{i + 1}</span>
                <h3 className="heading mt-2 text-2xl text-navy">{s.title}</h3>
                <p className="mt-1 text-[15px] text-ink/75">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Register */}
      <section id="register" aria-labelledby="reg-h" className="dust-texture relative scroll-mt-32 bg-navy py-12 text-white md:py-20">
        <div className="speed-lines absolute inset-0" aria-hidden />
        <div className="container-x relative grid gap-8 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <SectionHeading eyebrow="Get on the grid" title={<span id="reg-h">Register your interest</span>} tone="dark" />
            <p className="text-lg text-white/85">Tell us a little about you. We&apos;ll get back to you with the schedule, requirements and package details for the next leg.</p>
            <p className="mt-6 text-white/75">
              Questions? <a href={`mailto:${site.contactEmail}`} className="font-semibold text-gold underline underline-offset-2">{site.contactEmail}</a>
            </p>
          </div>
          <LeadForm
            formType="driver-registration"
            endpoint={FORM_ENDPOINTS.driver}
            email={site.contactEmail}
            subject={`${site.name} driver registration — {name} ({path})`}
            submitLabel="Register"
            successText="You're on the list. Our team will contact you with the schedule and details for the next leg."
            pixelEvent="CompleteRegistration"
            hashSelect="path"
            fields={[
              { name: "name", label: "Full name", type: "text", required: true, autoComplete: "name" },
              { name: "mobile", label: "Mobile", type: "tel", required: true, autoComplete: "tel", placeholder: "+63" },
              { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
              { name: "city", label: "City / province", type: "text", required: true, autoComplete: "address-level2" },
              { name: "path", label: "Which path?", type: "radio-cards", required: true, options: c.paths.map((p) => ({ value: p.id, label: p.name, hint: p.tag })) },
              {
                name: "experience",
                label: "Racing experience",
                type: "select",
                required: true,
                placeholder: "Choose…",
                options: [
                  { value: "none", label: "None yet — complete beginner" },
                  { value: "other-motorsport", label: "Some motorsport (karting, track days, autocross…)" },
                  { value: "rally", label: "Rally / rallycross experience" },
                  { value: "licensed", label: "Licensed competitor" },
                ],
              },
              {
                name: "car",
                label: "Do you have a rally car?",
                type: "select",
                required: true,
                placeholder: "Choose…",
                options: [
                  { value: "no", label: "No" },
                  { value: "yes", label: "Yes" },
                  { value: "building", label: "Building / preparing one" },
                ],
              },
              { name: "legs", label: "Legs you'd like to race", type: "checkboxes", options: [...legs.map((l) => ({ value: `R${l.round} ${l.name}`, label: `R${l.round} ${l.name}` })), { value: "Not sure yet", label: "Not sure yet" }] },
              { name: "message", label: "Anything else?", type: "textarea", placeholder: "Your car, team, or questions." },
            ]}
          />
        </div>
      </section>
    </>
  );
}
