import type { MetadataRoute } from "next";
import { getArticles, getCategories, getJobs, getLegalPages, getProducts, getRecipes, getSettings, getStores } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSettings().brand.siteUrl;
  const statics = ["", "/kategorien", "/rezepte", "/filialen", "/angebote", "/magazin", "/ueber-uns", "/nachhaltigkeit", "/karriere", "/bonus", "/kontakt", "/konto", "/login", "/warenkorb", "/checkout"];
  const dyn = [
    ...getCategories().map((c) => `/kategorien/${c.slug}`),
    ...getProducts().map((p) => `/produkt/${p.slug}`),
    ...getRecipes().map((r) => `/rezepte/${r.slug}`),
    ...getStores().map((s) => `/filialen/${s.slug}`),
    ...getArticles().map((a) => `/magazin/${a.slug}`),
    ...getJobs().map((j) => `/karriere/${j.slug}`),
    ...getLegalPages().map((l) => `/${l.slug}`),
  ];
  const now = new Date();
  return [...statics, ...dyn].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/angebote" ? "daily" : "weekly",
    priority: path === "" ? 1 : path.startsWith("/produkt") ? 0.8 : 0.6,
    alternates: { languages: { de: `${base}${path}`, en: `${base}/en${path}` } },
  }));
}
