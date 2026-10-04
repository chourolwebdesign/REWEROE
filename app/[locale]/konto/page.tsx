import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AccountPanel } from "@/components/commerce/account-panel";
import { Breadcrumbs } from "@/components/brand/breadcrumbs";
import { SmartImage } from "@/components/ui/smart-image";
import { getBlur } from "@/lib/blur";
import { getProducts, getSettings } from "@/lib/content";
import { toCardProduct } from "@/lib/view-models";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { alternates: alternatesFor(locale, "/konto"), title: t("eyebrow"), robots: { index: false } };
}

/**
 * Konto: breadcrumbs + a framed plate above the panel. `AccountPanel` owns the page's h1 (personalised greeting),
 * so the page renders no PageHero of its own — one h1 per page.
 */
export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tn = await getTranslations("nav");
  const products = getProducts().map((p) => toCardProduct(p, locale));
  const src = "/images/placeholders/konto-hero.jpg";
  return (
    <section className="container-x pt-10 pb-24 md:pt-14">
      <Breadcrumbs items={[{ label: tn("home"), href: "/" }, { label: tn("account") }]} className="rule-b pb-4" />
      <div className="frame relative mt-8 h-40 overflow-hidden bg-surface md:h-56">
        <SmartImage src={src} alt="" blur={getBlur(src)} fill priority sizes="100vw" className="img-grade object-cover" />
      </div>
      <div className="mt-10">
        <Suspense><AccountPanel products={products} welcomePoints={getSettings().bonus.welcomePoints} /></Suspense>
      </div>
    </section>
  );
}
