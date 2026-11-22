/**
 * Generates the PLACEHOLDER wordmark /public/brand/parx-logo.svg as pure paths
 * (no font dependency, so it renders identically in <img>, OG images and email).
 * When the final logo arrives, just replace /public/brand/parx-logo.svg — this
 * script is only for regenerating the placeholder.  Run: npm run logo
 */
import fs from "node:fs";
import opentype from "opentype.js";

const load = (p) => {
  const b = fs.readFileSync(p);
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};
const heavy = load("node_modules/@fontsource/barlow/files/barlow-latin-900-italic.woff");
const cond = load("node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-700-italic.woff");

const NAVY = "#0B1F4B", RED = "#C8102E", GOLD = "#F2A900";

function word(font, text, x, baseline, size, tracking = 0) {
  const p = font.getPath(text, x, baseline, size, { letterSpacing: tracking });
  const bb = p.getBoundingBox();
  return { d: p.toPathData(2), bb };
}

const parx = word(heavy, "PARX", 0, 200, 260, -0.01);
const open = word(cond, "OPEN", parx.bb.x2 + 14, 200, 110, 0.02);
const right = open.bb.x2;
const left = parx.bb.x1;
// Livery stripes, skewed like the brand image: long gold, red, two white dashes.
const sy = 228, sh = 26, sk = 9;
const seg = (x1, x2, fill, light) => `<path d="M${x1 + sk} ${sy}H${x2 + sk}L${x2} ${sy + sh}H${x1}Z" fill="${fill}"${light ? ' class="w"' : ""}/>`;
const W = right - left;
const g1 = left + W * 0.58, g2 = g1 + W * 0.2;
const stripes = [
  seg(left, g1, GOLD),
  seg(g1 + 16, g2, RED),
  seg(g2 + 16, g2 + 16 + W * 0.085, "#FFFFFF", true),
  seg(g2 + 32 + W * 0.085, right - 4, "#FFFFFF", true),
].join("");

const vb = [Math.floor(left) - 4, Math.floor(parx.bb.y1) - 6, Math.ceil(W) + 22, Math.ceil(sy + sh - parx.bb.y1) + 12];
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(" ")}" role="img" aria-label="PARX Open">
<!-- PLACEHOLDER wordmark. Replace this file with the final logo (keep the filename). -->
<title>PARX Open</title>
<path d="${parx.d}" fill="#FFFFFF"/>
<path d="${open.d}" fill="${GOLD}"/>
${stripes}
</svg>
`;
fs.writeFileSync("public/brand/parx-logo.svg", svg);
// A dark-on-light variant used on dust backgrounds and in print.
fs.writeFileSync("public/brand/parx-logo-dark.svg", svg.replaceAll('fill="#FFFFFF"', `fill="${NAVY}"`));
console.log("wrote public/brand/parx-logo.svg", vb);
