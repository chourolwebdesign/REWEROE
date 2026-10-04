import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/commerce/login-form";
import { SmartImage } from "@/components/ui/smart-image";
import { getBlur } from "@/lib/blur";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { alternates: alternatesFor(locale, "/login"), title: t("login"), robots: { index: false } };
}

/** Login: a framed photograph beside the paper form — no wash, no overlay. `LoginForm` owns the h1. */
export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const src = "/images/placeholders/konto-hero.jpg";
  return (
    <section className="container-x grid min-h-[calc(100svh-4rem)] items-center gap-10 py-12 lg:grid-cols-2 lg:gap-16">
      <div className="frame relative hidden aspect-[4/5] overflow-hidden bg-surface lg:block">
        <SmartImage src={src} alt="" blur={getBlur(src)} fill priority sizes="50vw" className="img-grade object-cover" />
      </div>
      <div className="mx-auto w-full max-w-md"><LoginForm /></div>
    </section>
  );
}
