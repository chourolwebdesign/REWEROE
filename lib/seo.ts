import type { Metadata } from "next";

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
