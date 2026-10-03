import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { OrderConfirmation } from "@/components/commerce/order-confirmation";

export const metadata: Metadata = { title: "Bestätigung", robots: { index: false } };

export default async function ConfirmationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <section className="container-x pt-[calc(72px+5rem)] pb-28"><OrderConfirmation /></section>;
}
