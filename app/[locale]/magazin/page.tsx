import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/brand/page-hero";
import { ArticleCard } from "@/components/cards/article-card";
import { ArticleFilter } from "@/components/commerce/article-filter";
import { getArticles } from "@/lib/content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "magazine" });
  return { alternates: alternatesFor(locale, "/magazin"), title: t("title"), description: t("text") };
}

export default async function MagazinePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("magazine");
  const articles = getArticles();
  const cats = ["saison", "gesundheit", "region"];
  const cards: Record<string, React.ReactNode> = {};
  const featureCards: Record<string, React.ReactNode> = {};
  for (const a of articles) {
    cards[a.slug] = <ArticleCard a={a} locale={locale} />;
    featureCards[a.slug] = <ArticleCard a={a} locale={locale} feature />;
  }
  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} text={t("text")} image="/images/placeholders/hero-magazin.jpg" imageAlt={t("heroImageAlt")} />
      <section className="container-x pb-20">
        <ArticleFilter articles={articles.map((a) => ({ slug: a.slug, category: a.category, featured: a.featured }))} categories={cats} cards={cards} featureCards={featureCards} />
      </section>
    </>
  );
}
