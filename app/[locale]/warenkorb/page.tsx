import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CartPage } from "@/components/commerce/cart-page";
import { getSettings } from "@/lib/content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cart" });
  return { title: t("title"), robots: { index: false } };
}

export default async function CartRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cart");
  const d = getSettings().delivery;
  return (
    <section className="container-x pt-[calc(72px+3rem)] pb-24">
      <p className="eyebrow mb-3">{t("eyebrow")}</p>
      <h1 className="mb-10 text-[clamp(2rem,4vw,3.5rem)] text-forest dark:text-cream">{t("title")}</h1>
      <CartPage cfg={{ deliveryFee: d.deliveryFee, freeFrom: d.freeFrom, minOrder: d.minOrder, pickup: d.pickup }} />
    </section>
  );
}
