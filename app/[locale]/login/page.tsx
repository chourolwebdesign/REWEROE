import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/commerce/login-form";
import { SmartImage } from "@/components/ui/smart-image";
import { getBlur } from "@/lib/blur";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("login"), robots: { index: false } };
}

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const src = "/images/placeholders/konto-hero.jpg";
  return (
    <section className="grid min-h-[100svh] pt-[72px] lg:grid-cols-2">
      <div className="relative hidden lg:block"><SmartImage src={src} alt="" blur={getBlur(src)} fill priority sizes="50vw" className="object-cover" /><div className="absolute inset-0 bg-forest/40" /></div>
      <div className="flex items-center justify-center p-6 md:p-12"><div className="w-full max-w-md"><LoginForm /></div></div>
    </section>
  );
}
