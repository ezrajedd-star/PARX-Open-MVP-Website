"use client";
/**
 * Generic lead form used for sponsorship inquiries, driver registrations and host-city requests.
 * Posts JSON to `endpoint` (Formspree or similar). With no endpoint, or if the request fails,
 * it falls back to a pre-filled email to `email`.
 */
import { useEffect, useRef, useState } from "react";
import { buttonClass } from "../ui/Button";
import { CheckIcon } from "../ui/Icons";

export type FieldDef =
  | { name: string; label: string; type: "text" | "email" | "tel"; required?: boolean; autoComplete?: string; placeholder?: string; wide?: boolean }
  | { name: string; label: string; type: "select"; required?: boolean; options: { value: string; label: string }[]; placeholder?: string; wide?: boolean }
  | { name: string; label: string; type: "radio-cards"; required?: boolean; options: { value: string; label: string; hint?: string }[]; wide?: boolean }
  | { name: string; label: string; type: "checkboxes"; options: { value: string; label: string }[]; wide?: boolean }
  | { name: string; label: string; type: "textarea"; placeholder?: string; wide?: boolean };

interface Props {
  formType: string;
  fields: FieldDef[];
  endpoint: string;
  email: string;
  /** Email/notification subject; `{field}` placeholders are filled from the answers. */
  subject: string;
  submitLabel: string;
  successTitle?: string;
  successText: string;
  /** Meta Pixel standard event to fire on success. */
  pixelEvent?: string;
  /** Pre-select a value, e.g. { path: "rally-fundamentals" }. */
  initial?: Record<string, string>;
  /** Links like /drive#register-arrive-and-drive pre-select that option of this radio field. */
  hashSelect?: string;
}

type State = "idle" | "sending" | "sent" | "error";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEL_RE = /^[+\d][\d\s()-]{6,}$/;

export function LeadForm({ formType, fields, endpoint, email, subject, submitLabel, successTitle = "Thank you!", successText, pixelEvent = "Lead", initial = {}, hashSelect }: Props) {
  const [state, setState] = useState<State>("idle");
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!hashSelect) return;
    const apply = () => {
      const m = window.location.hash.match(/^#register-([\w-]+)$/);
      const el = m && formRef.current?.querySelector<HTMLInputElement>(`input[name="${hashSelect}"][value="${m[1]}"]`);
      if (el) el.checked = true;
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [hashSelect]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mailto, setMailto] = useState<string | null>(null);

  const read = (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const d: Record<string, string> = {};
    for (const f of fields) d[f.name] = f.type === "checkboxes" ? fd.getAll(f.name).map(String).join(", ") : String(fd.get(f.name) ?? "").trim();
    return { d, gotcha: !!fd.get("_gotcha") };
  };
  const label = (f: FieldDef, v: string) => (f.type === "select" || f.type === "radio-cards" ? (f.options.find((o) => o.value === v)?.label ?? v) : v);
  const subj = (d: Record<string, string>) =>
    subject.replace(/\{(\w+)\}/g, (_, k) => {
      const f = fields.find((x) => x.name === k);
      return (f ? label(f, d[k]) : d[k]) || "—";
    });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const { d, gotcha } = read(form);
    if (gotcha) return;
    const errs: Record<string, string> = {};
    for (const f of fields) {
      const v = d[f.name];
      if ("required" in f && f.required && !v) errs[f.name] = f.type === "select" || f.type === "radio-cards" ? "Please choose an option." : `Please enter your ${f.label.toLowerCase()}.`;
      else if (v && f.type === "email" && !EMAIL_RE.test(v)) errs[f.name] = "Please enter a valid email address.";
      else if (v && f.type === "tel" && !TEL_RE.test(v)) errs[f.name] = "Please enter a valid mobile number, e.g. +63 917 123 4567.";
    }
    setErrors(errs);
    if (Object.keys(errs).length) {
      form.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`)?.focus();
      return;
    }
    const readable = Object.fromEntries(fields.map((f) => [f.label, label(f, d[f.name]) || "—"]));
    const body = Object.entries(readable).map(([k, v]) => (k.length + String(v).length > 60 ? `${k}:\n${v}` : `${k}: ${v}`)).join("\n");
    const link = `mailto:${email}?subject=${encodeURIComponent(subj(d))}&body=${encodeURIComponent(body)}`;
    setMailto(link);
    if (!endpoint) {
      window.location.href = link;
      setState("sent");
      return;
    }
    setState("sending");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ formType, ...readable, _subject: subj(d), _replyto: d.email || undefined }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState("sent");
      form.reset();
      const w = window as unknown as { fbq?: (...a: unknown[]) => void };
      w.fbq?.("track", pixelEvent, { content_category: formType });
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
        <h3 className="heading mt-4 text-4xl">{successTitle}</h3>
        <p className="mt-2 text-ink/80">{endpoint ? successText : "Your email app should have opened with your message ready to send."}</p>
        {mailto && !endpoint && (
          <p className="mt-3 text-sm">
            Nothing opened?{" "}
            <a href={mailto} className="font-semibold text-red underline">
              Click here to email us
            </a>{" "}
            or write to{" "}
            <a href={`mailto:${email}`} className="font-semibold underline">
              {email}
            </a>
            .
          </p>
        )}
      </div>
    );

  const input = "mt-1 block h-12 w-full border-2 border-navy/20 bg-white px-3 text-base text-ink focus:border-navy focus:outline-none focus-visible:outline-none aria-[invalid=true]:border-red";
  const lab = "font-display text-sm font-bold uppercase tracking-wider text-navy";
  const choice = "flex min-h-11 cursor-pointer items-center gap-2 border-2 border-navy/15 px-3 py-2 text-sm font-medium has-[:checked]:border-navy has-[:checked]:bg-dust";
  const Err = ({ k }: { k: string }) => (errors[k] ? <p id={`${formType}-${k}-err`} className="mt-1 text-sm font-semibold text-red">{errors[k]}</p> : null);
  const inv = (k: string) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${formType}-${k}-err` : undefined });
  const id = (k: string) => `${formType}-${k}`;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-4 bg-white p-5 text-ink ring-1 ring-navy/10 md:grid-cols-2 md:p-8">
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {fields.map((f) => {
        const req = "required" in f && f.required;
        const wide = f.wide || f.type === "textarea" || f.type === "checkboxes" || f.type === "radio-cards" ? "md:col-span-2" : "";
        const star = req ? " *" : "";
        if (f.type === "checkboxes" || f.type === "radio-cards")
          return (
            <fieldset key={f.name} className={wide} {...(f.type === "radio-cards" ? inv(f.name) : {})}>
              <legend className={lab}>
                {f.label}
                {star}
              </legend>
              <div className={`mt-2 grid gap-2 ${f.type === "radio-cards" ? "sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3"}`}>
                {f.options.map((o) => (
                  <label key={o.value} className={`${choice} ${f.type === "radio-cards" ? "items-start py-3" : ""}`}>
                    <input
                      type={f.type === "radio-cards" ? "radio" : "checkbox"}
                      name={f.name}
                      value={o.value}
                      defaultChecked={initial[f.name] === o.value}
                      className={`h-4 w-4 shrink-0 accent-[var(--parx-red)] ${f.type === "radio-cards" ? "mt-0.5" : ""}`}
                    />
                    <span>
                      <span className="block font-semibold text-navy">{o.label}</span>
                      {"hint" in o && o.hint && <span className="mt-0.5 block text-xs font-normal text-ink/70">{o.hint}</span>}
                    </span>
                  </label>
                ))}
              </div>
              <Err k={f.name} />
            </fieldset>
          );
        return (
          <div key={f.name} className={wide}>
            <label htmlFor={id(f.name)} className={lab}>
              {f.label}
              {star}
            </label>
            {f.type === "textarea" ? (
              <textarea id={id(f.name)} name={f.name} rows={4} placeholder={f.placeholder} className={`${input} h-auto py-2`} />
            ) : f.type === "select" ? (
              <select id={id(f.name)} name={f.name} required={req} defaultValue={initial[f.name] ?? ""} className={input} {...inv(f.name)}>
                <option value="" disabled>
                  {f.placeholder ?? "Choose…"}
                </option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={id(f.name)}
                name={f.name}
                type={f.type}
                required={req}
                autoComplete={f.autoComplete}
                placeholder={f.placeholder}
                inputMode={f.type === "tel" ? "tel" : undefined}
                className={input}
                {...inv(f.name)}
              />
            )}
            <Err k={f.name} />
          </div>
        );
      })}
      <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:items-center md:justify-between">
        <p className="text-xs text-ink/70">We only use your details to reply to you.</p>
        <button type="submit" disabled={state === "sending"} className={`${buttonClass("red", "lg")} disabled:opacity-60`}>
          {state === "sending" ? "Sending…" : submitLabel}
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
