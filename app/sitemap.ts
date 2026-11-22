import type { MetadataRoute } from "next";
import { getArticles, getDrivers, getLegs, getTeams } from "@/lib/content";
import { absUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly", lastModified: Date = now) => ({ url: absUrl(path), lastModified, changeFrequency, priority });
  return [
    page("/", 1, "daily"),
    page("/news", 0.9, "daily"),
    page("/calendar", 0.9),
    page("/results", 0.9, "daily"),
    page("/results/teams", 0.8, "daily"),
    page("/teams", 0.8),
    page("/sponsorship", 0.9, "monthly"),
    page("/shop", 0.6, "monthly"),
    ...getLegs().flatMap((l) => [page(`/calendar/${l.slug}`, 0.8), page(`/results/${l.slug}`, 0.7, "daily")]),
    ...getArticles().map((a) => page(`/news/${a.slug}`, 0.7, "monthly", new Date(`${a.date}T08:00:00+08:00`))),
    ...getTeams().filter((t) => !t.independent).map((t) => page(`/teams/${t.slug}`, 0.6)),
    ...getDrivers().map((d) => page(`/drivers/${d.slug}`, 0.5)),
  ];
}
