import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/brand/page-hero";
import { Breadcrumbs } from "@/components/brand/breadcrumbs";
import { CategoryBrowser } from "@/components/commerce/category-browser";
import { getCategories, getCategory, getProducts, getProductsByCategory } from "@/lib/content";
import { toCardProduct } from "@/lib/view-models";
import { tx } from "@/lib/l10n";

export function generateStaticParams() {
  return [{ slug: "alle" }, ...getCategories().map((c) => ({ slug: c.slug }))];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "category" });
  const c = getCategory(slug);
  return { title: c ? tx(c.name, locale) : t("allTitle"), description: c ? tx(c.teaser, locale) : t("allText") };
}

export default async function CategoryPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("category");
  const tn = await getTranslations("nav");
  const tc = await getTranslations("common");
  const cat = slug === "alle" ? null : getCategory(slug);
  if (slug !== "alle" && !cat) notFound();

  const products = (cat ? getProductsByCategory(cat.slug) : getProducts()).map((p) => toCardProduct(p, locale));
  const categories = getCategories().map((c) => ({ slug: c.slug, name: c.name, count: getProductsByCategory(c.slug).length }));
  const title = cat ? tx(cat.name, locale) : t("allTitle");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={title} text={cat ? tx(cat.teaser, locale) : t("allText")} image={cat?.image.src ?? "/images/placeholders/filiale-roedelheim-innen.jpg"} compact>
        <Breadcrumbs inverse className="mt-8" items={[{ label: tn("home"), href: "/" }, { label: tn("categories"), href: "/kategorien" }, { label: cat ? title : tc("all") }]} />
      </PageHero>
      <CategoryBrowser products={products} categories={categories} current={slug} />
    </>
  );
}
