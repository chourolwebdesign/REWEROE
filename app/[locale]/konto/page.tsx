import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AccountPanel } from "@/components/commerce/account-panel";
import { SmartImage } from "@/components/ui/smart-image";
import { getBlur } from "@/lib/blur";
import { getProducts, getSettings } from "@/lib/content";
import { toCardProduct } from "@/lib/view-models";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { alternates: alternatesFor(locale, "/konto"), title: t("eyebrow"), robots: { index: false } };
}

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const products = getProducts().map((p) => toCardProduct(p, locale));
  const src = "/images/placeholders/konto-hero.jpg";
  return (
    <section className="pt-[72px]">
      <div className="relative h-40 overflow-hidden md:h-56"><SmartImage src={src} alt="" blur={getBlur(src)} fill priority sizes="100vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" /></div>
      <div className="container-x -mt-8 pb-24">
        <Suspense><AccountPanel products={products} welcomePoints={getSettings().payback.welcomePoints} /></Suspense>
      </div>
    </section>
  );
}
