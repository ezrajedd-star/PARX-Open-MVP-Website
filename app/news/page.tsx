import { ArticleCard, FeaturedArticleCard } from "@/components/news/ArticleCard";
import { NewsGrid } from "@/components/news/NewsGrid";
import { PageHero } from "@/components/ui/Section";
import { getArticles } from "@/lib/content";
import { pageMeta } from "@/lib/seo";
import { ArticleCategory } from "@/lib/types";

export const generateMetadata = () => pageMeta({ title: "News", description: "Race reports, announcements, driver features and partner news from the PARX Open rallycross championship.", path: "/news" });

export default function NewsPage() {
  const articles = getArticles();
  const featured = articles.find((a) => a.featured) ?? articles[0];
  const rest = articles.filter((a) => a !== featured);
  return (
    <>
      <PageHero eyebrow="Latest from the paddock" title="News" compact />
      <section className="bg-dust py-8 md:py-12">
        <div className="container-x">
          {featured && (
            <div className="mb-10">
              <FeaturedArticleCard a={featured} headingLevel="h2" priority />
            </div>
          )}
          <h2 className="sr-only">More articles</h2>
          <NewsGrid categories={ArticleCategory.options} items={rest.map((a) => ({ key: a.slug, category: a.category, node: <ArticleCard a={a} /> }))} />
        </div>
      </section>
    </>
  );
}
