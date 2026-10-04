import type { MetadataRoute } from "next";
import { getArticles, getCategories, getJobs, getLegalPages, getProducts, getRecipes, getSettings, getStores } from "@/lib/content";

type Entry = { path: string; lastModified?: string };

/**
 * Indexable routes only: /konto, /login, /warenkorb and /checkout are noindex (robots.ts disallows them) and legal
 * pages join once published. `lastModified` comes from content dates (articles, jobs, legal) — never the build time.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSettings().brand.siteUrl;
  const statics: Entry[] = ["", "/kategorien", "/kategorien/alle", "/rezepte", "/filialen", "/angebote", "/magazin", "/regional", "/bio", "/ueber-uns", "/nachhaltigkeit", "/karriere", "/bonus", "/kontakt"].map((path) => ({ path }));
  const dyn: Entry[] = [
    ...getCategories().map((c) => ({ path: `/kategorien/${c.slug}` })),
    ...getProducts().map((p) => ({ path: `/produkt/${p.slug}` })),
    ...getRecipes().map((r) => ({ path: `/rezepte/${r.slug}` })),
    ...getStores().filter((s) => s.status === "published").map((s) => ({ path: `/filialen/${s.slug}` })),
    ...getArticles().map((a) => ({ path: `/magazin/${a.slug}`, lastModified: a.publishedAt })),
    ...getJobs().map((j) => ({ path: `/karriere/${j.slug}`, lastModified: j.datePosted })),
    ...getLegalPages().filter((l) => l.status === "published").map((l) => ({ path: `/${l.slug}`, lastModified: l.updatedAt ?? undefined })),
  ];
  return [...statics, ...dyn].map(({ path, lastModified }) => ({
    url: `${base}${path}`,
    ...(lastModified ? { lastModified } : {}),
    changeFrequency: path === "" || path === "/angebote" ? "daily" : "weekly",
    priority: path === "" ? 1 : path.startsWith("/produkt") ? 0.8 : 0.6,
    alternates: { languages: { de: `${base}${path}`, en: `${base}/en${path}` } },
  }));
}
