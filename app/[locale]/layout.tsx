import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fraunces, inter, spaceGrotesk } from "@/app/fonts";
import { SiteHeader, type NavCategory } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SearchDialog, type SearchEntry } from "@/components/layout/search-dialog";
import { Providers } from "@/components/layout/providers";
import { JsonLd } from "@/components/seo/json-ld";
import { getArticles, getCategories, getPrimaryStore, getProducts, getRecipes, getSettings } from "@/lib/content";
import { getBlur } from "@/lib/blur";
import "@/app/globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const s = getSettings();
  return {
    metadataBase: new URL(s.brand.siteUrl),
    title: { default: t("defaultTitle"), template: `%s · ${t("siteName")}` },
    description: t("defaultDescription"),
    applicationName: t("siteName"),
    alternates: { canonical: locale === "de" ? "/" : "/en", languages: { de: "/", en: "/en", "x-default": "/" } },
    openGraph: { type: "website", locale: locale === "de" ? "de_DE" : "en_GB", siteName: t("siteName"), title: t("defaultTitle"), description: t("defaultDescription"), images: ["/images/placeholders/hero-tazelik.jpg"] },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const settings = getSettings();
  const store = getPrimaryStore();
  const navCategories: NavCategory[] = getCategories().map((c) => ({ slug: c.slug, name: c.name, teaser: c.teaser, image: c.image.src, blur: getBlur(c.image.src) }));
  const searchIndex: SearchEntry[] = [
    ...getProducts().map((p) => ({ type: "product" as const, slug: p.slug, title: p.name, sub: p.subtitle, image: p.images[0].src, keywords: p.tags.join(" ") })),
    ...getRecipes().map((r) => ({ type: "recipe" as const, slug: r.slug, title: r.title, sub: r.teaser, image: r.image.src })),
    ...getArticles().map((a) => ({ type: "article" as const, slug: a.slug, title: a.title, sub: a.excerpt, image: a.cover.src })),
  ];

  const org = {
    "@context": "https://schema.org",
    "@type": "GroceryStore",
    name: `${settings.brand.name} ${store.name.replace("REWE ", "")} · ${settings.brand.merchant}`,
    url: settings.brand.siteUrl,
    image: `${settings.brand.siteUrl}/images/placeholders/filiale-roedelheim-aussen.jpg`,
    address: { "@type": "PostalAddress", addressLocality: store.address.city, postalCode: store.address.zip, addressRegion: "Hessen", addressCountry: "DE", ...(store.address.street ? { streetAddress: store.address.street } : {}) },
    geo: { "@type": "GeoCoordinates", latitude: store.coords[0], longitude: store.coords[1] },
    openingHoursSpecification: Object.entries(store.hours).filter(([, v]) => v).map(([d, v]) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: ({ mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" } as Record<string, string>)[d], opens: v![0], closes: v![1] })),
    paymentAccepted: settings.payments.join(", "),
    priceRange: "€€",
  };

  return (
    <html lang={locale} suppressHydrationWarning className={`${fraunces.variable} ${inter.variable} ${spaceGrotesk.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>
          <Providers>
            <JsonLd data={org} />
            <SiteHeader categories={navCategories} merchant={`${settings.brand.district}`} logoSrc={settings.brand.logo} />
            <SearchDialog index={searchIndex} />
            <main id="main" className="flex-1">{children}</main>
            <SiteFooter />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
