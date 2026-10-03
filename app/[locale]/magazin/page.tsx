import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/brand/page-hero";
import { ArticleCard } from "@/components/cards/article-card";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
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
  const feature = articles.find((a) => a.featured) ?? articles[0];
  const rest = articles.filter((a) => a.slug !== feature.slug);
  const cats = ["saison", "gesundheit", "region"] as const;
  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} text={t("text")} image="/images/placeholders/hero-magazin.jpg" compact />
      <section className="container-x py-14">
        <div className="mono mb-8 flex flex-wrap gap-2 text-[11px] uppercase tracking-wider">
          {cats.map((c) => <span key={c} className="rounded-full border border-line px-3 py-1">{t(`category.${c}`)}</span>)}
        </div>
        <Reveal><ArticleCard a={feature} locale={locale} feature /></Reveal>
        <Stagger className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((a) => <StaggerItem key={a.slug}><ArticleCard a={a} locale={locale} /></StaggerItem>)}
        </Stagger>
      </section>
    </>
  );
}
