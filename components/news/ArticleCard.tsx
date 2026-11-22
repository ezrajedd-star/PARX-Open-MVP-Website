import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { Article } from "@/lib/types";
import { Photo } from "../ui/Photo";

export function CategoryTag({ category, tone = "red" }: { category: string; tone?: "red" | "gold" }) {
  return (
    <span className={`inline-block px-2 py-0.5 font-display text-xs font-extrabold uppercase italic tracking-wider ${tone === "red" ? "bg-red text-white" : "bg-gold text-navy"}`}>
      {category}
    </span>
  );
}

function Meta({ a, light = false }: { a: Article; light?: boolean }) {
  return (
    <p className={`mt-2 flex flex-wrap items-center gap-x-2 text-xs ${light ? "text-white/75" : "text-ink/65"}`}>
      <time dateTime={a.date}>{formatDate(a.date, "short")}</time>
      <span aria-hidden>•</span>
      <span>{a.readMinutes} min read</span>
      {a.sample && (
        <>
          <span aria-hidden>•</span>
          <span className={`font-bold uppercase ${light ? "text-gold" : "text-[#7a5400]"}`}>Sample article</span>
        </>
      )}
    </p>
  );
}

export function ArticleCard({ a, headingLevel = "h3" }: { a: Article; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <article className="group relative flex flex-col bg-white ring-1 ring-navy/10">
      <div className="relative overflow-hidden">
        <Photo src={a.image} alt={a.imageAlt} kind="hero" className="aspect-[16/9] transition duration-500 group-hover:scale-[1.03]" sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" showLabel={false} />
        <div className="absolute left-3 top-3">
          <CategoryTag category={a.category} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <H className="font-display text-[1.45rem] font-bold uppercase italic leading-[1.05] text-navy">
          <Link href={`/news/${a.slug}`} className="after:absolute after:inset-0 group-hover:text-red">
            {a.title}
          </Link>
        </H>
        <Meta a={a} />
      </div>
    </article>
  );
}

export function FeaturedArticleCard({ a, headingLevel = "h3", priority = false, fill = false }: { a: Article; headingLevel?: "h2" | "h3"; priority?: boolean; fill?: boolean }) {
  const H = headingLevel;
  return (
    <article className={`group relative overflow-hidden bg-navy text-white ${fill ? "lg:h-full" : ""}`}>
      <Photo src={a.image} alt={a.imageAlt} kind="hero" className={`aspect-[4/5] sm:aspect-[16/9] ${fill ? "lg:aspect-auto lg:h-full lg:min-h-[480px]" : "lg:aspect-[21/9]"}`} sizes="(min-width:1024px) 66vw, 100vw" priority={priority} showLabel={false} />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/50 to-transparent" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
        <CategoryTag category={a.category} tone="gold" />
        <H className="heading mt-3 max-w-3xl text-[2.35rem] md:text-6xl">
          <Link href={`/news/${a.slug}`} className="after:absolute after:inset-0 group-hover:text-gold">
            {a.title}
          </Link>
        </H>
        <p className="mt-3 hidden max-w-2xl text-white/80 sm:block">{a.excerpt}</p>
        <Meta a={a} light />
      </div>
    </article>
  );
}
