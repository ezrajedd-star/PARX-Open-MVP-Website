import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArticleCard, CategoryTag } from "@/components/news/ArticleCard";
import { mdxComponents } from "@/components/news/MdxComponents";
import { NextRaceCta } from "@/components/news/NextRaceCta";
import { ShareButtons } from "@/components/news/ShareButtons";
import { Photo } from "@/components/ui/Photo";
import { SampleBadge, SectionHeading } from "@/components/ui/Section";
import { getArticle, getArticles, getSite } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { JsonLd, absUrl, pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => getArticles().map((a) => ({ slug: a.slug }));

export async function generateMetadata({ params }: Props) {
  const a = getArticle((await params).slug);
  if (!a) return {};
  const m = pageMeta({ title: a.title, description: a.excerpt, path: `/news/${a.slug}`, type: "article" });
  return { ...m, openGraph: { ...m.openGraph, type: "article", publishedTime: a.date, authors: [a.author], section: a.category } };
}

export default async function ArticlePage({ params }: Props) {
  const a = getArticle((await params).slug);
  if (!a) notFound();
  const site = getSite();
  const all = getArticles().filter((x) => x.slug !== a.slug);
  const related = [...all.filter((x) => x.category === a.category), ...all.filter((x) => x.category !== a.category)].slice(0, 3);
  const url = absUrl(`/news/${a.slug}`);

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: a.title,
          description: a.excerpt,
          datePublished: `${a.date}T08:00:00+08:00`,
          author: { "@type": "Organization", name: a.author },
          publisher: { "@type": "Organization", name: site.name, logo: { "@type": "ImageObject", url: absUrl(site.logo) } },
          image: [absUrl(`/news/${a.slug}/opengraph-image`)],
          mainEntityOfPage: url,
        }}
      />
      <header className="relative isolate overflow-hidden bg-navy text-white">
        <Photo src={a.image} alt={a.imageAlt} kind="hero" className="absolute inset-0" priority sizes="100vw" showLabel={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/75 to-navy-deep/20" aria-hidden />
        <div className="container-x relative max-w-4xl pb-8 pt-24 md:pb-12 md:pt-40">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-white/70">
            <Link href="/news" className="hover:underline">News</Link> / <span>{a.category}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            <CategoryTag category={a.category} tone="gold" />
            {a.sample && <SampleBadge label="Sample article" className="!text-gold" />}
          </div>
          <h1 className="heading mt-3 text-[2.6rem] md:text-7xl">{a.title}</h1>
          <p className="mt-4 text-lg text-white/85">{a.excerpt}</p>
          <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-sm text-white/75">
            <span>By <span className="font-semibold text-white">{a.author}</span></span>
            <span aria-hidden>•</span>
            <time dateTime={a.date}>{formatDate(a.date)}</time>
            <span aria-hidden>•</span>
            <span>{a.readMinutes} min read</span>
          </p>
        </div>
      </header>

      <div className="container-x max-w-3xl py-8 md:py-12">
        <div className="mb-8 border-b border-navy/10 pb-6">
          <ShareButtons url={url} title={a.title} />
        </div>
        <div className="prose-parx">
          {/* Content is trusted (lives in the repo), so prop expressions like images={[...]} are allowed; dangerous JS stays blocked. */}
          <MDXRemote source={a.body} components={mdxComponents} options={{ blockJS: false, blockDangerousJS: true }} />
        </div>
        <div className="mt-10 border-t border-navy/10 pt-6">
          <ShareButtons url={url} title={a.title} />
        </div>
      </div>

      <div className="container-x max-w-5xl pb-10">
        <NextRaceCta />
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-h" className="bg-dust py-10 md:py-16">
          <div className="container-x">
            <SectionHeading eyebrow="Keep reading" title={<span id="related-h">Related articles</span>} href="/news" linkLabel="All news" />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {related.map((r) => (
                <li key={r.slug} className="flex [&>*]:w-full">
                  <ArticleCard a={r} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}
