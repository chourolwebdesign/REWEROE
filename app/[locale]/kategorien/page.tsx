import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/brand/page-hero";
import { CategoryCard } from "@/components/cards/category-card";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Cta } from "@/components/brand/cta";
import { getCategories } from "@/lib/content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "category" });
  return { alternates: alternatesFor(locale, "/kategorien"), title: t("allTitle"), description: t("allText") };
}

export default async function CategoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("category");
  const tn = await getTranslations("nav");
  const tc = await getTranslations("common");
  const categories = getCategories();
  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("allTitle")}
        text={t("allText")}
        image="/images/placeholders/filiale-roedelheim-innen.jpg"
        imageAlt={t("heroImageAlt")}
        breadcrumbs={[{ label: tn("home"), href: "/" }, { label: tn("categories") }]}
      />
      <section className="container-x pb-20">
        <Stagger className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
          {categories.map((c, i) => <StaggerItem key={c.slug}><CategoryCard c={c} locale={locale} index={i} /></StaggerItem>)}
        </Stagger>
        <div className="rule mt-12 flex justify-center pt-8"><Cta href="/kategorien/alle" variant="secondary">{tc("showAll")}</Cta></div>
      </section>
    </>
  );
}
