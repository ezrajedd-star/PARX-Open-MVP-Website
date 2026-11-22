/** Shared helpers for generated Open Graph images (1200×630, Facebook-friendly). */
import fs from "node:fs/promises";
import path from "node:path";
import type { ReactNode } from "react";
import { getSite } from "./content";

export const OG_SIZE = { width: 1200, height: 630 };

export async function ogFonts() {
  const f = (n: string) => fs.readFile(path.join(process.cwd(), "assets/fonts", n));
  const [display, display7, inter] = await Promise.all([
    f("barlow-condensed-latin-800-italic.woff"),
    f("barlow-condensed-latin-700-normal.woff"),
    f("inter-latin-600-normal.woff"),
  ]);
  return [
    { name: "Barlow", data: display, weight: 800 as const, style: "italic" as const },
    { name: "Barlow", data: display7, weight: 700 as const, style: "normal" as const },
    { name: "Inter", data: inter, weight: 600 as const, style: "normal" as const },
  ];
}

export async function logoDataUrl() {
  const svg = await fs.readFile(path.join(process.cwd(), "public", getSite().logo.replace(/^\//, "")));
  return `data:image/svg+xml;base64,${svg.toString("base64")}`;
}

/** Branded frame: navy, speed stripes, livery bar, logo top-left. */
export function OgFrame({ logo, children, tag }: { logo: string; children: ReactNode; tag?: string }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#0B1F4B", color: "#fff", fontFamily: "Inter", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: -160, top: 0, width: 520, height: 630, background: "linear-gradient(270deg, rgba(200,16,46,.55), rgba(200,16,46,0))", transform: "skewX(-24deg)", display: "flex" }} />
      <div style={{ position: "absolute", right: 210, top: 0, width: 26, height: 630, background: "#F2A900", transform: "skewX(-24deg)", display: "flex" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "48px 64px 0" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} height={64} alt="" />
        {tag && <div style={{ display: "flex", background: "#F2A900", color: "#0B1F4B", fontFamily: "Barlow", fontWeight: 800, fontStyle: "italic", fontSize: 28, padding: "4px 14px", textTransform: "uppercase" }}>{tag}</div>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "0 64px 56px", justifyContent: "flex-end" }}>{children}</div>
      <div style={{ display: "flex", height: 14, width: "100%" }}>
        <div style={{ flex: 58, background: "#F2A900", display: "flex" }} />
        <div style={{ flex: 22, background: "#C8102E", display: "flex" }} />
        <div style={{ flex: 20, background: "#fff", display: "flex" }} />
      </div>
    </div>
  );
}
