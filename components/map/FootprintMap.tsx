import Link from "next/link";
import type { Leg } from "@/lib/types";
import { LAND_PATH, MAP_H, MAP_W, projectLngLat } from "./ph-map-data";

/**
 * Host cities on a real coastline map of the Visayas and Northern Mindanao
 * (Natural Earth 10m, pre-projected by scripts/build-map.mjs — no tiles, no third-party requests).
 */
export function FootprintMap({ legs, caption = true }: { legs: Leg[]; caption?: boolean }) {
  const pts = legs.map((l) => {
    const [x, y] = projectLngLat(l.coordinates.lng, l.coordinates.lat);
    return { l, x, y };
  });
  // Greedy label placement: try right, left, above, below; keep the first spot that stays
  // inside the map and clear of every pin and already-placed label.
  type Box = { x1: number; y1: number; x2: number; y2: number };
  const hit = (a: Box, b: Box) => a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
  const pinBoxes: Box[] = pts.map((p) => ({ x1: p.x - 10, y1: p.y - 10, x2: p.x + 10, y2: p.y + 10 }));
  const taken: Box[] = [];
  const placed = pts.map((p) => {
    const w = (`R${p.l.round} ${p.l.name}`.length) * 11 + 4;
    const options = [
      { anchor: "start", tx: p.x + 16, ty: p.y + 7, box: { x1: p.x + 14, y1: p.y - 12, x2: p.x + 16 + w, y2: p.y + 10 } },
      { anchor: "end", tx: p.x - 16, ty: p.y + 7, box: { x1: p.x - 16 - w, y1: p.y - 12, x2: p.x - 14, y2: p.y + 10 } },
      { anchor: "middle", tx: p.x, ty: p.y - 18, box: { x1: p.x - w / 2, y1: p.y - 36, x2: p.x + w / 2, y2: p.y - 14 } },
      { anchor: "middle", tx: p.x, ty: p.y + 34, box: { x1: p.x - w / 2, y1: p.y + 14, x2: p.x + w / 2, y2: p.y + 36 } },
    ] as const;
    const fits = (o: (typeof options)[number]) =>
      o.box.x1 >= 4 && o.box.x2 <= MAP_W - 4 && o.box.y1 >= 4 && o.box.y2 <= MAP_H - 4 && ![...pinBoxes, ...taken].some((b) => hit(b, o.box));
    const o = options.find(fits) ?? options[0];
    taken.push(o.box);
    return { ...p, anchor: o.anchor, tx: o.tx, ty: o.ty };
  });
  return (
    <figure>
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="h-auto w-full" role="img" aria-label={`Map of the Visayas and Northern Mindanao with the host cities: ${legs.map((l) => `Round ${l.round} ${l.name}`).join(", ")}`}>
        <defs>
          <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="rgb(255 255 255 / .05)" />
          </pattern>
          <filter id="land-shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity=".35" />
          </filter>
        </defs>
        <rect width={MAP_W} height={MAP_H} fill="var(--parx-navy-deep)" />
        <rect width={MAP_W} height={MAP_H} fill="url(#map-grid)" />
        <path d={LAND_PATH} fill="#1d3a7a" stroke="rgb(233 228 218 / .45)" strokeWidth="1" strokeLinejoin="round" filter="url(#land-shadow)" />
        <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="var(--parx-gold)" strokeWidth="2.5" strokeDasharray="7 7" strokeLinecap="round" opacity=".85" />
        {placed.map(({ l, x, y, anchor, tx, ty }) => (
          <g key={l.slug}>
            <circle cx={x} cy={y} r="16" fill="var(--parx-red)" opacity=".3" />
            <circle cx={x} cy={y} r="8" fill="var(--parx-red)" stroke="#fff" strokeWidth="2.5" />
            <text
              x={tx}
              y={ty}
              textAnchor={anchor}
              fill="#fff"
              stroke="var(--parx-navy-deep)"
              strokeWidth="4"
              paintOrder="stroke"
              strokeLinejoin="round"
              style={{ font: "800 italic 21px var(--font-display)", textTransform: "uppercase" }}
            >
              <tspan fill="var(--parx-gold)">R{l.round}</tspan> {l.name}
            </text>
          </g>
        ))}
        {[
          ["VISAYAS", 0.04, 0.06],
          ["MINDANAO", 0.55, 0.95],
        ].map(([t, fx, fy]) => (
          <text key={t as string} x={MAP_W * (fx as number)} y={MAP_H * (fy as number)} fill="rgb(255 255 255 / .35)" style={{ font: "700 16px var(--font-display)", letterSpacing: "0.3em" }}>
            {t}
          </text>
        ))}
      </svg>
      {caption && (
        <figcaption className="mt-2 text-xs text-white/70">
          Host cities of the {legs.length}-leg season. Map data: Natural Earth. <Link href="/calendar" className="underline">See the calendar</Link>
        </figcaption>
      )}
    </figure>
  );
}
