import Link from "next/link";
import type { Leg } from "@/lib/types";

/** Schematic (not a geographic map): host cities plotted by their coordinates. */
export function FootprintMap({ legs }: { legs: Leg[] }) {
  const lat = legs.map((l) => l.coordinates.lat), lng = legs.map((l) => l.coordinates.lng);
  const [minLat, maxLat, minLng, maxLng] = [Math.min(...lat) - 0.7, Math.max(...lat) + 0.9, Math.min(...lng) - 0.6, Math.max(...lng) + 0.6];
  const W = 400, H = 320;
  const x = (v: number) => ((v - minLng) / (maxLng - minLng)) * W;
  const y = (v: number) => H - ((v - minLat) / (maxLat - minLat)) * H;
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Host cities: ${legs.map((l) => l.name).join(", ")}`}>
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="rgb(255 255 255 / .06)" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#grid)" />
        <polyline points={legs.map((l) => `${x(l.coordinates.lng)},${y(l.coordinates.lat)}`).join(" ")} fill="none" stroke="var(--parx-gold)" strokeWidth="2" strokeDasharray="6 6" opacity=".7" />
        {legs.map((l) => {
          const cx = x(l.coordinates.lng), cy = y(l.coordinates.lat);
          const above = l.round % 2 === 1;
          const anchor = cx < 70 ? "start" : cx > W - 70 ? "end" : "middle";
          return (
            <g key={l.slug}>
              <circle cx={cx} cy={cy} r="14" fill="var(--parx-red)" opacity=".25" />
              <circle cx={cx} cy={cy} r="7" fill="var(--parx-red)" stroke="#fff" strokeWidth="2" />
              <text x={anchor === "start" ? cx - 8 : anchor === "end" ? cx + 8 : cx} y={above ? cy - 16 : cy + 30} textAnchor={anchor} fill="#fff" style={{ font: "800 italic 18px var(--font-display)", textTransform: "uppercase" }}>
                R{l.round} {l.name}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2 text-xs text-white/60">
        Schematic of host cities (not to scale). <Link href="/calendar" className="underline">See the calendar</Link>
      </figcaption>
    </figure>
  );
}
