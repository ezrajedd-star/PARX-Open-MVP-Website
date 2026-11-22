import type { Metadata } from "next";
import { getSite } from "./content";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const absUrl = (p = "/") => `${SITE_URL}${p.startsWith("/") ? p : `/${p}`}`;

/** Per-page metadata with Open Graph + Twitter defaults. OG images come from opengraph-image.tsx files. */
export function pageMeta({ title, description, path, type = "website" }: { title?: string; description?: string; path: string; type?: "website" | "article" }): Metadata {
  const site = getSite();
  const desc = description ?? site.description;
  return {
    title,
    description: desc,
    alternates: { canonical: path },
    openGraph: { title: title ? `${title} | ${site.name}` : site.name, description: desc, url: path, type, siteName: site.name, locale: "en_PH" },
    twitter: { card: "summary_large_image", title: title ? `${title} | ${site.name}` : site.name, description: desc },
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
