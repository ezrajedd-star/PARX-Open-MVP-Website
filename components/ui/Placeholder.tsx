/**
 * Branded placeholder artwork — used wherever we do not have a real photo yet.
 * Clearly labelled so nothing reads as a real image by accident.
 * Pure SVG/CSS: zero network requests, crisp at any size.
 */
import type { CSSProperties } from "react";

type Kind = "driver" | "car" | "hero" | "team" | "generic" | "merch";

function initials(label?: string) {
  if (!label) return "P";
  const words = label.replace(/^Team\s+/i, "").split(/[\s/]+/).filter((w) => /^[A-Za-z0-9]/.test(w));
  return words.length === 1 ? words[0].slice(0, 3).toUpperCase() : words.map((w) => w[0]).join("").slice(0, 3).toUpperCase();
}

const LABEL: Record<Kind, string> = {
  driver: "Driver photo",
  car: "Car photo",
  hero: "Photo / video placeholder",
  team: "Team logo",
  generic: "Photo placeholder",
  merch: "Product photo",
};

/** Generic hatchback rally-car silhouette (not any real model). viewBox 0 0 400 160 */
export function CarSilhouette({ className, color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 400 160" className={className} aria-hidden focusable="false">
      <g fill={color}>
        <path d="M22 112c-6 0-10-4-10-9v-14c0-6 3-10 9-12l40-12 46-30c8-5 16-7 26-7h86c11 0 19 3 27 9l38 30 58 8c14 2 24 9 26 20l3 15c1 5-2 9-7 9h-26a40 40 0 0 0-79 0H130a40 40 0 0 0-79 0Z" />
        <path d="M368 52h22l-4 22h-12Z" />
      </g>
      <g fill="none" stroke={color} strokeOpacity=".35" strokeWidth="3">
        <path d="M118 61 150 38c6-4 11-5 18-5h37v28Z" />
        <path d="M217 33h47c8 0 13 2 19 7l26 21h-92Z" />
      </g>
      <circle cx="90" cy="118" r="30" fill={color} />
      <circle cx="90" cy="118" r="13" fill="none" stroke="#000" strokeOpacity=".25" strokeWidth="5" />
      <circle cx="307" cy="118" r="30" fill={color} />
      <circle cx="307" cy="118" r="13" fill="none" stroke="#000" strokeOpacity=".25" strokeWidth="5" />
    </svg>
  );
}

function DriverSilhouette({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 220" className="absolute bottom-0 left-1/2 h-[82%] -translate-x-1/2" aria-hidden focusable="false">
      <g fill={color}>
        <path d="M100 18c30 0 52 22 52 54 0 12-2 22-6 30-3 7-11 11-18 11H72c-7 0-15-4-18-11-4-8-6-18-6-30 0-32 22-54 52-54Z" />
        <path d="M18 220c4-50 30-80 82-80s78 30 82 80Z" />
      </g>
      <path d="M58 70h84c4 0 6 3 5 7l-4 16c-1 3-4 5-7 5H64c-3 0-6-2-7-5l-4-16c-1-4 1-7 5-7Z" fill="#000" fillOpacity=".28" />
    </svg>
  );
}

export function Placeholder({
  kind = "generic",
  label,
  className = "",
  accent = "var(--parx-gold)",
  tone = "navy",
  style,
  showLabel = true,
}: {
  kind?: Kind;
  label?: string;
  className?: string;
  accent?: string;
  tone?: "navy" | "dust";
  style?: CSSProperties;
  showLabel?: boolean;
}) {
  const dark = tone === "navy";
  const fg = dark ? "rgb(255 255 255 / 0.16)" : "rgb(11 31 75 / 0.18)";
  return (
    <div
      role="img"
      aria-label={`${label ?? LABEL[kind]} (placeholder)`}
      className={`dust-texture ${/\babsolute\b/.test(className) ? "" : "relative"} overflow-hidden ${dark ? "bg-navy text-white" : "bg-dust text-navy"} ${className}`}
      style={style}
    >
      <div className="speed-lines absolute inset-0" aria-hidden />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: dark
            ? `radial-gradient(120% 80% at 80% 110%, rgb(233 228 218 / .25), transparent 60%), linear-gradient(160deg, transparent 40%, rgb(6 18 46 / .7))`
            : `radial-gradient(120% 80% at 80% 110%, rgb(11 31 75 / .12), transparent 60%)`,
        }}
      />
      {kind === "driver" && <DriverSilhouette color={fg} />}
      {(kind === "car" || kind === "hero") && (
        <div className="absolute inset-x-[8%] bottom-[12%] flex items-end justify-center" aria-hidden>
          <CarSilhouette className="w-full max-w-[560px] -skew-x-3" color={fg} />
        </div>
      )}
      {kind === "team" && (
        <div className="absolute inset-0 grid place-items-center" aria-hidden>
          <div className="heading text-[2.2em] opacity-30">{initials(label)}</div>
        </div>
      )}
      {kind === "merch" && (
        <svg viewBox="0 0 100 100" className="absolute left-1/2 top-1/2 h-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden>
          <path d="M34 14 18 22 8 40l14 7 6-9v50h44V38l6 9 14-7-10-18-16-8c-2 6-8 10-16 10s-14-4-16-10Z" fill={fg} />
        </svg>
      )}
      <div className="absolute left-0 top-0 h-full w-1.5" style={{ background: accent }} aria-hidden />
      {showLabel && (
        <span
          aria-hidden
          className={`absolute bottom-2 right-2 rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${dark ? "bg-white/10 text-white/75" : "bg-navy/10 text-navy/70"}`}
        >
          {label ?? LABEL[kind]} · placeholder
        </span>
      )}
    </div>
  );
}
