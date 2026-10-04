/**
 * CONTENT-READY data layer.
 * Every page reads through these functions; swapping JSON for Supabase/Prisma
 * only touches `source.ts`. Pages never know where data comes from.
 */
import { readCollection, readSingle } from "./source";
import type {
  About, Article, BioPage, Bonus, Campaign, Category, Faq, Job, LegalPage, Producer, Product, Recipe, RegionalPage,
  Settings, Store, Sustainability,
} from "./types";

export * from "./types";

export const getSettings = () => readSingle<Settings>("settings");
export const getCategories = () => readCollection<Category>("categories").sort((a, b) => a.order - b.order);
export const getCategory = (slug: string) => getCategories().find((c) => c.slug === slug) ?? null;

export const getProducts = () => readCollection<Product>("products");
export const getProduct = (slug: string) => getProducts().find((p) => p.slug === slug) ?? null;
export const getProductsByCategory = (slug: string) => getProducts().filter((p) => p.category === slug);
export const getProductsBySlugs = (slugs: string[]) =>
  slugs.map((s) => getProduct(s)).filter((p): p is Product => Boolean(p));

export const getProducers = () => readCollection<Producer>("producers");
export const getProducer = (slug: string) => getProducers().find((p) => p.slug === slug) ?? null;

export const getRecipes = () => readCollection<Recipe>("recipes");
export const getRecipe = (slug: string) => getRecipes().find((r) => r.slug === slug) ?? null;
export const getFeaturedRecipe = () => getRecipes().find((r) => r.featured) ?? getRecipes()[0];

export const getStores = () => readCollection<Store>("stores");
export const getStore = (slug: string) => getStores().find((s) => s.slug === slug) ?? null;
export const getPrimaryStore = () => getStores()[0];

export const getCampaigns = () => readCollection<Campaign>("campaigns");
/** Campaigns that are currently valid (or all, when `includeExpired`). */
export const getActiveCampaigns = (now = new Date()) =>
  getCampaigns().filter((c) => new Date(c.validUntil).getTime() > now.getTime());
export const getCampaignForProduct = (slug: string, now = new Date()) =>
  getActiveCampaigns(now).find((c) => c.productSlug === slug) ?? null;

export const getArticles = () =>
  readCollection<Article>("articles").sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
export const getArticle = (slug: string) => getArticles().find((a) => a.slug === slug) ?? null;

export const getJobs = () => readCollection<Job>("jobs");
export const getJob = (slug: string) => getJobs().find((j) => j.slug === slug) ?? null;

export const getLegalPages = () => readCollection<LegalPage>("legalPages");
export const getLegalPage = (slug: string) => getLegalPages().find((l) => l.slug === slug) ?? null;

export const getAbout = () => readSingle<About>("about");
export const getSustainability = () => readSingle<Sustainability>("sustainability");
export const getBonus = () => readSingle<Bonus>("bonus");
export const getFaq = () => readCollection<Faq>("faq");

/** Popular products for 404 and empty states: highest review count. */
export const getPopularProducts = (n = 3) =>
  [...getProducts()].sort((a, b) => b.reviews - a.reviews).slice(0, n);

/** Regional products: those whose producer is within 100 km. */
export const getRegionalProducts = () => {
  const producers = new Map(getProducers().map((p) => [p.slug, p]));
  return getProducts().filter((p) => (producers.get(p.origin.producer)?.distanceKm ?? 999) <= 100);
};

/* ── REWE Regional / REWE Bio world pages ───────────────────────────────── */
export const REGIONAL_RADIUS_KM = 100;
export const getRegionalPage = () => readSingle<RegionalPage>("regional");
export const getBioPage = () => readSingle<BioPage>("bio");
/** Products carrying the `bio` badge (REWE Bio range). */
export const getBioProducts = () => getProducts().filter((p) => p.badges.includes("bio"));
/** Producers within the regional radius (≤ 100 km), nearest first; in-store crafts (0 km) last. */
export const getRegionalProducers = () =>
  getProducers()
    .filter((p) => p.distanceKm <= REGIONAL_RADIUS_KM)
    .sort((a, b) => (a.distanceKm === 0 ? 1 : 0) - (b.distanceKm === 0 ? 1 : 0) || a.distanceKm - b.distanceKm);
