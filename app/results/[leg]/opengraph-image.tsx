import { ImageResponse } from "next/og";
import { driverMap, getLegClassification, getLegsWithStatus, teamMap } from "@/lib/data";
import { OG_SIZE, OgFrame, logoDataUrl, ogFonts } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "PARX Open leg results podium";
export const generateStaticParams = () => getLegsWithStatus().map((l) => ({ leg: l.slug }));

export default async function Image({ params }: { params: Promise<{ leg: string }> }) {
  const { leg: slug } = await params;
  const leg = getLegsWithStatus().find((l) => l.slug === slug)!;
  const c = getLegClassification(slug);
  const dm = driverMap();
  const tm = teamMap();
  const podium = (c?.rows ?? []).filter((r) => r.position && r.position <= 3);
  const col: Record<number, string> = { 1: "#F2A900", 2: "#C9CED6", 3: "#CD7F32" };
  const h: Record<number, number> = { 1: 200, 2: 150, 3: 110 };
  return new ImageResponse(
    (
      <OgFrame logo={await logoDataUrl()} tag={c?.sample ? "Sample data" : "Results"}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "Barlow", fontWeight: 700, fontSize: 30, letterSpacing: 4, color: "#F2A900", textTransform: "uppercase" }}>{`Round ${leg.round} · ${leg.islandGroup}`}</div>
            <div style={{ fontFamily: "Barlow", fontWeight: 800, fontStyle: "italic", fontSize: 140, lineHeight: 0.9, textTransform: "uppercase" }}>{leg.name}</div>
            <div style={{ fontFamily: "Barlow", fontWeight: 700, fontSize: 34, textTransform: "uppercase", color: "rgba(255,255,255,.75)" }}>Final classification</div>
          </div>
          {podium.length > 0 ? (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
              {[2, 1, 3].map((p) => {
                const r = podium.find((x) => x.position === p);
                if (!r) return <div key={p} style={{ display: "flex", width: 170 }} />;
                const d = dm.get(r.driverSlug)!;
                return (
                  <div key={p} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 170 }}>
                    <div style={{ fontFamily: "Barlow", fontWeight: 800, fontStyle: "italic", fontSize: 40, textTransform: "uppercase" }}>{d.displayName}</div>
                    <div style={{ fontSize: 16, color: "rgba(255,255,255,.7)", marginBottom: 8 }}>{tm.get(d.teamSlug)!.independent ? "Independent" : tm.get(d.teamSlug)!.name}</div>
                    <div style={{ display: "flex", width: 170, height: h[p], background: col[p], color: "#0B1F4B", justifyContent: "center", paddingTop: 8, fontFamily: "Barlow", fontWeight: 800, fontStyle: "italic", fontSize: 72 }}>{p}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontFamily: "Barlow", fontWeight: 800, fontStyle: "italic", fontSize: 48 }}>Results coming soon</div>
          )}
        </div>
      </OgFrame>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
