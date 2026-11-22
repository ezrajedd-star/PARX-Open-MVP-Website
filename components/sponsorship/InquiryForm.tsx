"use client";
import { useState } from "react";
import { buttonClass } from "../ui/Button";
import { CheckIcon } from "../ui/Icons";

interface Props {
  tiers: { id: string; name: string }[];
  legs: { slug: string; label: string }[];
  email: string;
  siteName: string;
}

type State = "idle" | "sending" | "sent" | "error";

/**
 * Sponsorship inquiry. Posts JSON to NEXT_PUBLIC_FORM_ENDPOINT (Formspree or similar).
 * With no endpoint configured — or if the request fails — it opens a pre-filled email instead.
 */
export function InquiryForm({ tiers, legs, email, siteName }: Props) {
  const endpoint = process.env.NEXT_PUBLIC_FORM_ENDPOINT;
  const [state, setState] = useState<State>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mailto, setMailto] = useState<string | null>(null);

  function buildMailto(d: Record<string, string>) {
    const body = [
      `Name: ${d.name}`,
      `Company: ${d.company}`,
      `Email: ${d.email}`,
      `Mobile: ${d.mobile}`,
      `Tier of interest: ${d.tier}`,
      `Legs of interest: ${d.legs || "—"}`,
      "",
      d.message,
    ].join("\n");
    return `mailto:${email}?subject=${encodeURIComponent(`${siteName} sponsorship inquiry — ${d.company}`)}&body=${encodeURIComponent(body)}`;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (fd.get("_gotcha")) return; // honeypot
    const d: Record<string, string> = {
      name: String(fd.get("name") ?? "").trim(),
      company: String(fd.get("company") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      mobile: String(fd.get("mobile") ?? "").trim(),
      tier: String(fd.get("tier") ?? ""),
      legs: fd.getAll("legs").map(String).join(", "),
      message: String(fd.get("message") ?? "").trim(),
    };
    const errs: Record<string, string> = {};
    if (!d.name) errs.name = "Please enter your name.";
    if (!d.company) errs.company = "Please enter your company or brand.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) errs.email = "Please enter a valid email address.";
    if (d.mobile && !/^[+\d][\d\s()-]{6,}$/.test(d.mobile)) errs.mobile = "Please enter a valid mobile number, e.g. +63 917 123 4567.";
    if (!d.tier) errs.tier = "Please choose a tier.";
    setErrors(errs);
    if (Object.keys(errs).length) {
      form.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`)?.focus();
      return;
    }
    const link = buildMailto(d);
    setMailto(link);
    if (!endpoint) {
      window.location.href = link;
      setState("sent");
      return;
    }
    setState("sending");
    try {
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ ...d, _subject: `${siteName} sponsorship inquiry — ${d.company}` }) });
      if (!res.ok) throw new Error(String(res.status));
      setState("sent");
      form.reset();
      if (typeof window !== "undefined" && "fbq" in window) (window as unknown as { fbq: (...a: unknown[]) => void }).fbq("track", "Lead");
    } catch {
      setState("error");
    }
  }

  if (state === "sent")
    return (
      <div role="status" className="bg-white p-6 text-navy ring-1 ring-navy/10 md:p-8">
        <span className="grid h-12 w-12 place-items-center bg-gold text-navy">
          <CheckIcon />
        </span>
        <h3 className="heading mt-4 text-4xl">Thank you!</h3>
        <p className="mt-2 text-ink/80">
          {endpoint
            ? "Your inquiry is in. Our partnerships team will get back to you shortly with the sponsor deck and leg availability."
            : "Your email app should have opened with your inquiry ready to send."}
        </p>
        {mailto && !endpoint && (
          <p className="mt-3 text-sm">
            Nothing opened?{" "}
            <a href={mailto} className="font-semibold text-red underline">
              Click here to email us
            </a>{" "}
            or write to <a href={`mailto:${email}`} className="font-semibold underline">{email}</a>.
          </p>
        )}
      </div>
    );

  const field = "mt-1 block h-12 w-full border-2 border-navy/20 bg-white px-3 text-base text-ink focus:border-navy focus:outline-none focus-visible:outline-none aria-[invalid=true]:border-red";
  const label = "font-display text-sm font-bold uppercase tracking-wider text-navy";
  const Err = ({ k }: { k: string }) => (errors[k] ? <p id={`${k}-err`} className="mt-1 text-sm font-semibold text-red">{errors[k]}</p> : null);
  const inv = (k: string) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${k}-err` : undefined });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 bg-white p-5 text-ink ring-1 ring-navy/10 md:grid-cols-2 md:p-8">
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div>
        <label htmlFor="f-name" className={label}>Name *</label>
        <input id="f-name" name="name" autoComplete="name" required className={field} {...inv("name")} />
        <Err k="name" />
      </div>
      <div>
        <label htmlFor="f-company" className={label}>Company / brand *</label>
        <input id="f-company" name="company" autoComplete="organization" required className={field} {...inv("company")} />
        <Err k="company" />
      </div>
      <div>
        <label htmlFor="f-email" className={label}>Email *</label>
        <input id="f-email" name="email" type="email" autoComplete="email" required className={field} {...inv("email")} />
        <Err k="email" />
      </div>
      <div>
        <label htmlFor="f-mobile" className={label}>Mobile</label>
        <input id="f-mobile" name="mobile" type="tel" autoComplete="tel" inputMode="tel" placeholder="+63" className={field} {...inv("mobile")} />
        <Err k="mobile" />
      </div>
      <div className="md:col-span-2">
        <label htmlFor="f-tier" className={label}>Tier of interest *</label>
        <select id="f-tier" name="tier" required defaultValue="" className={field} {...inv("tier")}>
          <option value="" disabled>Choose a tier…</option>
          {tiers.map((t) => (
            <option key={t.id} value={t.name}>{t.name}</option>
          ))}
          <option value="Season bundle">Season bundle (all legs)</option>
          <option value="Driver / team sponsorship">Driver / team sponsorship</option>
          <option value="Not sure yet">Not sure yet</option>
        </select>
        <Err k="tier" />
      </div>
      <fieldset className="md:col-span-2">
        <legend className={label}>Legs of interest</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {legs.map((l) => (
            <label key={l.slug} className="flex min-h-11 cursor-pointer items-center gap-2 border-2 border-navy/15 px-3 py-2 text-sm font-medium has-[:checked]:border-navy has-[:checked]:bg-dust">
              <input type="checkbox" name="legs" value={l.label} className="h-4 w-4 accent-[var(--parx-red)]" />
              {l.label}
            </label>
          ))}
          <label className="flex min-h-11 cursor-pointer items-center gap-2 border-2 border-navy/15 px-3 py-2 text-sm font-medium has-[:checked]:border-navy has-[:checked]:bg-dust">
            <input type="checkbox" name="legs" value="All legs" className="h-4 w-4 accent-[var(--parx-red)]" />
            All legs
          </label>
        </div>
      </fieldset>
      <div className="md:col-span-2">
        <label htmlFor="f-message" className={label}>Message</label>
        <textarea id="f-message" name="message" rows={4} className={`${field} h-auto py-2`} placeholder="Tell us about your brand and goals." />
      </div>
      <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:items-center md:justify-between">
        <p className="text-xs text-ink/60">We only use your details to reply to this inquiry.</p>
        <button type="submit" disabled={state === "sending"} className={`${buttonClass("red", "lg")} disabled:opacity-60`}>
          {state === "sending" ? "Sending…" : "Send inquiry"}
        </button>
      </div>
      {state === "error" && (
        <p role="alert" className="text-sm font-semibold text-red md:col-span-2">
          Sorry, the form couldn&apos;t be sent.{" "}
          {mailto && (
            <a href={mailto} className="underline">
              Send it by email instead
            </a>
          )}
          .
        </p>
      )}
    </form>
  );
}
