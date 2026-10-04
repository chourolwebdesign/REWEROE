import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { OrderConfirmation } from "@/components/commerce/order-confirmation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return { alternates: alternatesFor(locale, "/checkout/bestaetigung"), title: t("confirmEyebrow"), robots: { index: false } };
}

/** `OrderConfirmation` owns the h1; the sticky header needs no top offset (§3.3 H). */
export default async function ConfirmationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <section className="container-x pt-20 pb-28"><OrderConfirmation /></section>;
}
