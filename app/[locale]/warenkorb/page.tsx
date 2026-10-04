import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/brand/page-hero";
import { CartPage } from "@/components/commerce/cart-page";
import { getSettings } from "@/lib/content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cart" });
  return { alternates: alternatesFor(locale, "/warenkorb"), title: t("title"), robots: { index: false } };
}

export default async function CartRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cart");
  const tn = await getTranslations("nav");
  const d = getSettings().delivery;
  return (
    <>
      <PageHero compact eyebrow={t("eyebrow")} title={t("title")} breadcrumbs={[{ label: tn("home"), href: "/" }, { label: tn("cart") }]} />
      <section className="container-x pb-24">
        <CartPage cfg={{ deliveryFee: d.deliveryFee, freeFrom: d.freeFrom, minOrder: d.minOrder, pickup: d.pickup }} />
      </section>
    </>
  );
}
