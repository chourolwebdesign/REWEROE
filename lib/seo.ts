import type { Metadata } from "next";
import { getSettings } from "@/lib/content";
import type { Settings, Store, Weekday } from "@/lib/content/types";

/** Per-page canonical + hreflang alternates. `path` is the German (unprefixed) route, e.g. "/rezepte". */
export function alternatesFor(locale: string, path: string): NonNullable<Metadata["alternates"]> {
  const de = path === "" ? "/" : path;
  const en = `/en${path}`;
  return { canonical: locale === "en" ? en : de, languages: { de, en, "x-default": de } };
}

/** Site origin: production domain from settings, overridable for local audits. */
export function siteOrigin(fallback: string) {
  return process.env.NEXT_PUBLIC_SITE_URL || fallback;
}

/** URL prefix per locale — "" for German (default, `localePrefix: "as-needed"`), "/en" for English. */
export const localePrefix = (locale: string) => (locale === "de" ? "" : `/${locale}`);

/**
 * Absolute URL of a German (unprefixed) route in the given locale, for JSON-LD and feeds:
 * absUrl("en", "/produkt/erdbeeren") → "https://…/en/produkt/erdbeeren"; `path` "" or "/" is the home page.
 */
export function absUrl(locale: string, path: string, base: string = getSettings().brand.siteUrl): string {
  const clean = path === "/" ? "" : path;
  return `${base.replace(/\/$/, "")}${localePrefix(locale)}${clean}`;
}

const SCHEMA_DAY: Record<Weekday, string> = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };

/**
 * Site-wide GroceryStore JSON-LD (root layout). Publishes only what the store has confirmed: opening hours once
 * `hoursStatus === "published"` (the same gate as filialen/[slug]), the street once the address is published, and
 * photographs only when they are real (nothing from /images/placeholders/).
 */
export function storeLd(store: Store, settings: Settings, locale: string) {
  const base = settings.brand.siteUrl;
  const photos = store.images.filter((i) => !i.src.includes("/placeholders/")).map((i) => `${base}${i.src}`);
  const street = store.address.status === "published" && store.address.street ? { streetAddress: store.address.street } : {};
  const hours = (Object.keys(store.hours) as Weekday[])
    .filter((d) => store.hours[d])
    .map((d) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: SCHEMA_DAY[d], opens: store.hours[d]![0], closes: store.hours[d]![1] }));
  return {
    "@context": "https://schema.org",
    "@type": "GroceryStore",
    name: `${settings.brand.name} ${store.name.replace(/^REWE\s+/, "")} · ${settings.brand.merchant}`,
    url: absUrl(locale, "", base),
    ...(photos.length ? { image: photos } : {}),
    address: { "@type": "PostalAddress", ...street, postalCode: store.address.zip, addressLocality: store.address.city, addressRegion: "Hessen", addressCountry: "DE" },
    geo: { "@type": "GeoCoordinates", latitude: store.coords[0], longitude: store.coords[1] },
    ...(store.phone ? { telephone: store.phone } : {}),
    ...(store.hoursStatus === "published" && hours.length ? { openingHoursSpecification: hours } : {}),
    paymentAccepted: settings.payments.join(", "),
    priceRange: "€€",
  };
}
