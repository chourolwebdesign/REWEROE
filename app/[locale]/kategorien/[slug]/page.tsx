import type { Metadata } from "next";
import { Suspense } from "react";
import { alternatesFor } from "@/lib/seo";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/brand/page-hero";
import { CategoryBrowser } from "@/components/commerce/category-browser";
import { getCategories, getCategory, getProducts, getProductsByCategory } from "@/lib/content";
import { toCardProduct } from "@/lib/view-models";
import { tx } from "@/lib/l10n";

export const revalidate = 3600;

export function generateStaticParams() {
  return [{ slug: "alle" }, ...getCategories().map((c) => ({ slug: c.slug }))];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "category" });
  const c = getCategory(slug);
  return { alternates: alternatesFor(locale, `/kategorien/${slug}`), title: c ? tx(c.name, locale) : t("allTitle"), description: c ? tx(c.teaser, locale) : t("allText") };
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
      {/* Category pages carry no image plate: the 4:5 product photos are the imagery, and they would crop badly at 21:9. „Alle" keeps the store interior. */}
      <PageHero
        eyebrow={t("eyebrow")}
        title={title}
        text={cat ? tx(cat.teaser, locale) : t("allText")}
        image={cat ? undefined : "/images/placeholders/filiale-roedelheim-innen.jpg"}
        imageAlt={cat ? undefined : t("heroImageAlt")}
        breadcrumbs={[{ label: tn("home"), href: "/" }, { label: tn("categories"), href: "/kategorien" }, { label: cat ? title : tc("all") }]}
        className="pb-0 md:pb-0"
      />
      {/* The browser reads `?herkunft=` with useSearchParams, so it renders on the client; the static shell carries the skeleton. */}
      <Suspense fallback={<BrowserFallback />}>
        <CategoryBrowser products={products} categories={categories} current={slug} />
      </Suspense>
    </>
  );
}

/** Mirrors the browser grid (sidebar column · toolbar rule · 4:5 tiles) so the page does not jump when it hydrates. */
function BrowserFallback() {
  return (
    <div className="container-x grid gap-x-6 gap-y-10 py-12 lg:grid-cols-12" aria-busy="true">
      <div className="hidden lg:col-span-3 lg:block" />
      <div className="lg:col-span-9">
        <div className="h-11 border-b border-line" />
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => <div key={i} className="aspect-[4/5] bg-surface-2" />)}
        </div>
      </div>
    </div>
  );
}
