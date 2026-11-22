import { ImageResponse } from "next/og";
import { getSite } from "@/lib/content";
import { OG_SIZE, OgFrame, logoDataUrl, ogFonts } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "PARX Open — Pilipinas Archipelago RallyCross Open";

export default async function Image() {
  const site = getSite();
  return new ImageResponse(
    (
      <OgFrame logo={await logoDataUrl()}>
        <div style={{ fontFamily: "Barlow", fontWeight: 700, fontSize: 30, letterSpacing: 6, color: "#F2A900", textTransform: "uppercase" }}>{site.fullName}</div>
        <div style={{ display: "flex", marginTop: 12, maxWidth: 1000, fontFamily: "Barlow", fontWeight: 800, fontStyle: "italic", fontSize: 108, lineHeight: 0.92, textTransform: "uppercase" }}>{site.tagline}</div>
      </OgFrame>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
