import type { Metadata } from "next";

/**
 * Domain und Indexierung kommen aus der Umgebung:
 * - SITE_URL: kanonische Adresse (z. B. https://rewe-roedelheim.de). Ohne Angabe die Vercel-Produktionsadresse.
 * - SITE_INDEXABLE=true: erst dann dürfen Suchmaschinen indexieren. Vorschau und vercel.app bleiben noindex.
 */
const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const SITE_URL = (process.env.SITE_URL ?? (vercelProduction ? `https://${vercelProduction}` : "http://localhost:3000")).replace(/\/$/, "");
export const INDEXABLE = process.env.SITE_INDEXABLE === "true";

export const NAV = [
  { href: "/angebote", label: "Angebote" },
  { href: "/markt", label: "Unser Markt" },
  { href: "/aktuelles", label: "Aktuelles" },
  { href: "/karriere", label: "Karriere" },
  { href: "/kontakt", label: "Kontakt" },
] as const;

export const absoluteUrl = (path = "/") => `${SITE_URL}${path === "/" ? "" : path}`;

export const SITE_NAME = "REWE Rödelheim";

/** Teilen-Bild einer Seite (erzeugt von app/og/[slug]/route.tsx), z. B. ogImagePath("karriere") → /og/karriere.jpg */
export const ogImagePath = (card: string) => `/og/${card}.jpg`;

/**
 * Metadaten einer Seite mit eigener Teilen-Vorschau. Next.js ersetzt `openGraph` je Seite komplett (keine
 * Vererbung einzelner Felder) – deshalb setzt jede Seite hier Titel, Beschreibung, Adresse und Bild selbst.
 */
export function pageMetadata({
  title,
  description,
  path,
  card,
  socialTitle = `${title} · ${SITE_NAME}`,
  publishedTime,
}: {
  title: string;
  description: string;
  path: string;
  /** Name der Teilen-Karte in lib/og.tsx */
  card: string;
  /** Titel in der Vorschau (WhatsApp, Facebook …), Standard: „Seitentitel · REWE Rödelheim“ */
  socialTitle?: string;
  /** nur Beiträge: Erscheinungsdatum (macht die Vorschau zum Artikel) */
  publishedTime?: string;
}): Metadata {
  const shared = {
    locale: "de_DE",
    siteName: SITE_NAME,
    url: path,
    title: socialTitle,
    description,
    images: [{ url: ogImagePath(card), width: 1200, height: 630, alt: socialTitle }],
  };
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: publishedTime ? { ...shared, type: "article", publishedTime } : { ...shared, type: "website" },
  };
}

/**
 * Seiten mit rotem Kopf: Die Kopfleiste liegt dort anfangs transparent darüber – schon im Server-HTML, ohne Aufblitzen.
 * „/index“: So meldet usePathname() die Startseite beim Vorrendern auf Vercel; ohne diesen Eintrag ist die Leiste im HTML weiß,
 * im Browser transparent, React baut die Seite nach Fehler #418 neu auf und entfernt dabei die Klasse `js` von <html>.
 */
const HERO_PAGES = new Set(["/", "/index", "/angebote", "/markt", "/kontakt", "/karriere", "/aktuelles"]);
export const hasHero = (pathname: string) => HERO_PAGES.has(pathname) || /^\/aktuelles\/[^/]+$/.test(pathname);

/**
 * Meta-Beschreibung aus einem längeren Text: höchstens `max` Zeichen (Suchmaschinen zeigen etwa 160). Gekürzt wird an der letzten
 * Satzgrenze, die hineinpasst – ein Punkt zählt nur nach einem Wort mit mindestens drei Buchstaben und vor einem Großbuchstaben
 * (nicht nach „26.“ oder „z. B.“); sonst an einer Wortgrenze mit „…“.
 */
export function metaDescription(text: string, max = 160): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  let sentence = -1;
  for (const m of t.matchAll(/\p{L}{3,}[.!?](?= [\p{Lu}„"(])/gu)) {
    const end = m.index + m[0].length;
    if (end <= max && end >= 40) sentence = end;
  }
  if (sentence > 0) return t.slice(0, sentence);
  const head = t.slice(0, max);
  const word = head.lastIndexOf(" ");
  return head.slice(0, word > 0 ? word : max - 1).replace(/[,;:–-]$/, "") + "…";
}
