import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { schibsted, figtree, geistMono } from "@/app/fonts";
import { SiteHeader, type NavCategory } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SearchDialog, type SearchEntry } from "@/components/layout/search-dialog";
import { Providers } from "@/components/layout/providers";
import { JsonLd } from "@/components/seo/json-ld";
import { getArticles, getCategories, getPrimaryStore, getProducts, getRecipes, getSettings } from "@/lib/content";
import { getBlur } from "@/lib/blur";
import { alternatesFor, siteOrigin, storeLd } from "@/lib/seo";
import "@/app/globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** The token sheet is designed for both schemes (OS-driven, no toggle) — tell the UA so form controls and scrollbars follow. */
export const viewport: Viewport = { colorScheme: "light dark" };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const s = getSettings();
  return {
    metadataBase: new URL(siteOrigin(s.brand.siteUrl)),
    title: { default: t("defaultTitle"), template: `%s · ${t("siteName")}` },
    description: t("defaultDescription"),
    applicationName: t("siteName"),
    alternates: alternatesFor(locale, ""),
    openGraph: { type: "website", locale: locale === "de" ? "de_DE" : "en_GB", siteName: t("siteName"), title: t("defaultTitle"), description: t("defaultDescription"), images: ["/images/placeholders/hero-home.jpg"] },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

/**
 * Static routes in the search index (next to products, recipes and articles). `slug` is a unique id, `href` the route;
 * titles come from the nav/footer messages, teasers from `search.pageSub.*`, keywords cover de/en spellings.
 */
const STATIC_PAGES = [
  { slug: "angebote", href: "/angebote", title: "nav.offers", sub: "offers", image: "/images/placeholders/hero-angebote.jpg", keywords: "angebote prospekt rabatt knaller aktion deals offers leaflet sale" },
  { slug: "regional", href: "/regional", title: "nav.regional", prefix: "REWE ", sub: "regional", image: "/images/placeholders/hero-regional.jpg", keywords: "rewe regional aus deiner region erzeuger hessen hof producers local" },
  { slug: "bio", href: "/bio", title: "nav.bio", prefix: "REWE ", sub: "bio", image: "/images/placeholders/hero-bio.jpg", keywords: "rewe bio organic naturland öko oeko siegel" },
  { slug: "unser-markt", href: "/filialen", title: "nav.stores", sub: "store", keywords: "filiale markt laden store adresse anfahrt parkplatz rödelheim roedelheim services" },
  { slug: "oeffnungszeiten", href: "/filialen", title: "footer.hours", sub: "hours", keywords: "öffnungszeiten oeffnungszeiten geöffnet geoeffnet offen opening hours open closed" },
  { slug: "kontakt", href: "/kontakt", title: "nav.contact", sub: "contact", image: "/images/placeholders/hero-kontakt.jpg", keywords: "kontakt contact telefon e-mail email anfrage feedback" },
] as const;

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const settings = getSettings();
  const store = getPrimaryStore();
  const navCategories: NavCategory[] = getCategories().map((c) => ({ slug: c.slug, name: c.name, teaser: c.teaser, image: c.image.src, blur: getBlur(c.image.src) }));

  // Both locales' messages, so the static entries carry the same L10n shape as content records.
  const [de, en] = await Promise.all([getTranslations({ locale: "de" }), getTranslations({ locale: "en" })]);
  const storeHref = `/filialen/${store.slug}`;
  const storePhoto = store.images.find((i) => !i.src.includes("/placeholders/"))?.src;
  const pages: SearchEntry[] = STATIC_PAGES.map((p) => {
    const prefix = "prefix" in p ? p.prefix : "";
    const image = "image" in p ? p.image : storePhoto;
    return {
      type: "page",
      slug: p.slug,
      href: p.href === "/filialen" ? storeHref : p.href,
      title: { de: `${prefix}${de(p.title)}`, en: `${prefix}${en(p.title)}` },
      sub: { de: de(`search.pageSub.${p.sub}`), en: en(`search.pageSub.${p.sub}`) },
      ...(image ? { image } : {}),
      keywords: p.keywords,
    };
  });
  const searchIndex: SearchEntry[] = [
    ...pages,
    ...getProducts().map((p) => ({ type: "product" as const, slug: p.slug, title: p.name, sub: p.subtitle, image: p.images[0].src, keywords: p.tags.join(" ") })),
    ...getRecipes().map((r) => ({ type: "recipe" as const, slug: r.slug, title: r.title, sub: r.teaser, image: r.image.src })),
    ...getArticles().map((a) => ({ type: "article" as const, slug: a.slug, title: a.title, sub: a.excerpt, image: a.cover.src })),
  ];

  return (
    <html lang={locale} suppressHydrationWarning className={`${schibsted.variable} ${figtree.variable} ${geistMono.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>
          <Providers>
            <JsonLd data={storeLd(store, settings, locale)} />
            <SiteHeader categories={navCategories} merchant={settings.brand.district} logoSrc={settings.brand.logo} store={{ slug: store.slug, hours: store.hours, hoursStatus: store.hoursStatus, address: store.address }} />
            <SearchDialog index={searchIndex} />
            <main id="main" className="flex-1">{children}</main>
            <SiteFooter />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
