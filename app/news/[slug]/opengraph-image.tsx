import { ImageResponse } from "next/og";
import { getArticle, getArticles } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { OG_SIZE, OgFrame, logoDataUrl, ogFonts } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "PARX Open news";
export const generateStaticParams = () => getArticles().map((a) => ({ slug: a.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const a = getArticle((await params).slug)!;
  const len = a.title.length;
  return new ImageResponse(
    (
      <OgFrame logo={await logoDataUrl()} tag={a.sample ? "Sample article" : undefined}>
        <div style={{ display: "flex", alignSelf: "flex-start", background: "#C8102E", fontFamily: "Barlow", fontWeight: 800, fontStyle: "italic", fontSize: 30, padding: "4px 14px", textTransform: "uppercase" }}>{a.category}</div>
        <div style={{ display: "flex", marginTop: 18, maxWidth: 1000, fontFamily: "Barlow", fontWeight: 800, fontStyle: "italic", fontSize: len > 70 ? 66 : len > 45 ? 80 : 96, lineHeight: 0.95, textTransform: "uppercase" }}>{a.title}</div>
        <div style={{ display: "flex", marginTop: 20, fontSize: 24, color: "rgba(255,255,255,.75)" }}>{`${formatDate(a.date)} · ${a.readMinutes} min read`}</div>
      </OgFrame>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
