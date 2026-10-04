import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/brand/page-hero";
import { CheckoutFlow } from "@/components/commerce/checkout-flow";
import { getSettings } from "@/lib/content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return { alternates: alternatesFor(locale, "/checkout"), title: t("title"), robots: { index: false } };
}

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("checkout");
  const tn = await getTranslations("nav");
  const d = getSettings().delivery;
  return (
    <>
      <PageHero compact eyebrow={t("eyebrow")} title={t("title")} breadcrumbs={[{ label: tn("home"), href: "/" }, { label: tn("cart"), href: "/warenkorb" }, { label: t("eyebrow") }]} />
      <section className="container-x pb-24">
        <CheckoutFlow slots={d.slots} deliveryFee={d.deliveryFee} freeFrom={d.freeFrom} pickup={d.pickup} />
      </section>
    </>
  );
}
