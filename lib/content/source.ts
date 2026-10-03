/**
 * Data source adapter. Today: JSON files in /content.
 * Tomorrow: replace the two functions below with Supabase/Prisma queries
 * returning the same shapes — nothing else in the app changes.
 */
import settings from "@/content/settings.json";
import categories from "@/content/categories.json";
import products from "@/content/products.json";
import producers from "@/content/producers.json";
import recipes from "@/content/recipes.json";
import stores from "@/content/stores.json";
import campaigns from "@/content/campaigns.json";
import articles from "@/content/articles.json";
import jobs from "@/content/jobs.json";
import legalPages from "@/content/legalPages.json";
import about from "@/content/about.json";
import sustainability from "@/content/sustainability.json";
import bonus from "@/content/bonus.json";
import faq from "@/content/faq.json";

const collections: Record<string, unknown[]> = {
  categories, products, producers, recipes, stores, campaigns, articles, jobs, legalPages, faq,
};
const singles: Record<string, unknown> = { settings, about, sustainability, bonus };

export function readCollection<T>(name: string): T[] {
  const data = collections[name];
  if (!data) throw new Error(`Unknown content collection: ${name}`);
  return data as T[];
}

export function readSingle<T>(name: string): T {
  const data = singles[name];
  if (!data) throw new Error(`Unknown content document: ${name}`);
  return data as T;
}
