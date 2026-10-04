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
