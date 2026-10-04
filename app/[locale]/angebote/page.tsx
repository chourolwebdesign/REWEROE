import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/brand/page-hero";
import { FlipBrochure, type BrochureItem, type BrochurePage } from "@/components/signature/flip-brochure";
import { getActiveCampaigns, getCategories, getProduct } from "@/lib/content";
import { toCardProduct } from "@/lib/view-models";
import { formatDateShort } from "@/lib/format";
import { tx } from "@/lib/l10n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "offers" });
  return { alternates: alternatesFor(locale, "/angebote"), title: t("title"), description: t("text") };
}

export default async function OffersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("offers");
  const tc = await getTranslations("common");
  const campaigns = getActiveCampaigns();
  const byPage = new Map<number, BrochurePage["items"]>();
  let hero: BrochureItem | null = null;
  for (const c of campaigns) {
    const p = getProduct(c.productSlug);
    if (!p) continue;
    const item: BrochureItem = { ...toCardProduct(p, locale), campaignTitle: tx(c.title, locale), category: p.category };
    hero ??= item; // first active campaign = the hero deal (§4.15)
    byPage.set(c.page, [...(byPage.get(c.page) ?? []), item]);
  }
  const pages: BrochurePage[] = [...byPage.entries()].sort((a, b) => a[0] - b[0]).map(([n, items]) => ({ n, items }));
  const categories = getCategories().map((c) => ({ slug: c.slug, name: tx(c.name, locale) }));
  const validUntil = campaigns.map((c) => c.validUntil).sort().at(-1);

  return (
    <>
      <PageHero
        eyebrow={validUntil ? t("eyebrowValid", { date: formatDateShort(validUntil, locale) }) : t("eyebrow")}
        title={t("title")}
        text={t("text")}
        image="/images/placeholders/hero-angebote.jpg"
        imageAlt={t("heroImageAlt")}
      >
        <p className="price-meta">{tc("householdNote")}</p>
      </PageHero>
      <FlipBrochure pages={pages} categories={categories} hero={hero} />
    </>
  );
}
