import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Clock, Users, ChefHat } from "lucide-react";
import { Breadcrumbs } from "@/components/brand/breadcrumbs";
import { BulkIngredients, type IngredientVM } from "@/components/signature/bulk-ingredients";
import { RecipeCard } from "@/components/cards/recipe-card";
import { SectionHeading } from "@/components/brand/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SmartImage } from "@/components/ui/smart-image";
import { JsonLd } from "@/components/seo/json-ld";
import { getBlur } from "@/lib/blur";
import { tx } from "@/lib/l10n";
import { toCardProduct } from "@/lib/view-models";
import { getProduct, getRecipe, getRecipes, getSettings } from "@/lib/content";

export function generateStaticParams() {
  return getRecipes().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const r = getRecipe(slug);
  if (!r) return {};
  return { alternates: alternatesFor(locale, `/rezepte/${slug}`), title: tx(r.title, locale), description: tx(r.teaser, locale), openGraph: { images: [r.image.src] } };
}

export default async function RecipePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const r = getRecipe(slug);
  if (!r) notFound();
  const t = await getTranslations("recipes");
  const tn = await getTranslations("nav");
  const tc = await getTranslations("common");
  const settings = getSettings();
  const ingredients: IngredientVM[] = r.ingredients.map((i) => ({ name: tx(i.name, locale), amount: i.amount, unit: i.unit, product: i.productSlug ? (() => { const p = getProduct(i.productSlug!); return p ? toCardProduct(p, locale) : null; })() : null }));
  const similar = getRecipes().filter((x) => x.slug !== r.slug && (x.season === r.season || x.diet.some((d) => r.diet.includes(d)))).slice(0, 3);

  const ld = {
    "@context": "https://schema.org", "@type": "Recipe", name: tx(r.title, locale), description: tx(r.teaser, locale), image: `${settings.brand.siteUrl}${r.image.src}`,
    author: { "@type": "Organization", name: settings.brand.merchant }, totalTime: `PT${r.time}M`, recipeYield: `${r.servings}`, recipeCategory: tc(`season.${r.season}`),
    recipeIngredient: r.ingredients.map((i) => `${i.amount} ${i.unit} ${tx(i.name, locale)}`), recipeInstructions: r.steps.map((s) => ({ "@type": "HowToStep", text: tx(s, locale) })),
    nutrition: { "@type": "NutritionInformation", calories: `${r.nutrition.kcal} kcal` }, aggregateRating: { "@type": "AggregateRating", ratingValue: r.rating, reviewCount: 40 },
    suitableForDiet: r.diet.includes("vegan") ? "https://schema.org/VeganDiet" : r.diet.includes("vegetarisch") ? "https://schema.org/VegetarianDiet" : undefined,
  };

  return (
    <article>
      <JsonLd data={ld} />
      <section data-header-theme="dark" className="relative isolate overflow-hidden bg-forest text-cream">
        <div className="absolute inset-0 -z-10">
          <SmartImage src={r.image.src} alt={tx(r.image.alt, locale)} blur={getBlur(r.image.src)} fill priority sizes="100vw" className="object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/60 to-forest/20" />
        </div>
        <div className="container-x flex min-h-[70svh] flex-col justify-end pb-16 pt-32">
          <Breadcrumbs inverse className="mb-6" items={[{ label: tn("home"), href: "/" }, { label: tn("recipes"), href: "/rezepte" }, { label: tx(r.title, locale) }]} />
          <p className="eyebrow mb-4">{tc(`season.${r.season}`)}{r.diet.length ? ` · ${r.diet.join(" · ")}` : ""}</p>
          <h1 className="max-w-4xl text-cream">{tx(r.title, locale)}</h1>
          <p className="mt-5 max-w-2xl text-lg text-cream/80">{tx(r.teaser, locale)}</p>
          <ul className="mono mt-8 flex flex-wrap gap-6 text-[11px] uppercase tracking-[0.16em] text-cream/80">
            <li className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-gold" /> {tc("minutes", { n: r.time })}</li>
            <li className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-gold" /> {tc("servings", { n: r.servings })}</li>
            <li className="inline-flex items-center gap-2"><ChefHat className="h-4 w-4 text-gold" /> {tc(`difficulty.${r.difficulty}`)}</li>
            <li className="inline-flex items-center gap-2 text-gold">★ {r.rating.toFixed(1)}</li>
          </ul>
        </div>
      </section>

      <section className="container-x grid gap-12 py-16 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <Reveal><BulkIngredients ingredients={ingredients} servings={r.servings} /></Reveal>
        <div>
          <p className="eyebrow mb-6">{t("steps")}</p>
          <Stagger className="space-y-8">
            {r.steps.map((s, i) => (
              <StaggerItem key={i} className="grid grid-cols-[56px_1fr] gap-4">
                <span className="mono serif text-4xl leading-none text-gold">{String(i + 1).padStart(2, "0")}</span>
                <p className="pt-1 text-lg leading-relaxed">{tx(s, locale)}</p>
              </StaggerItem>
            ))}
          </Stagger>
          {r.tips.length > 0 && (
            <Reveal className="mt-12 rounded-[14px] border-l-2 border-gold bg-surface-2/60 p-6 ">
              <p className="eyebrow mb-2">{t("tips")}</p>
              {r.tips.map((tip, i) => <p key={i} className="serif text-xl leading-snug">{tx(tip, locale)}</p>)}
            </Reveal>
          )}
          <Reveal className="mt-12">
            <p className="eyebrow mb-3">{t("nutrition")}</p>
            <dl className="mono grid grid-cols-4 gap-3 text-center">
              {[["kcal", r.nutrition.kcal], ["Fett", `${r.nutrition.fat} g`], ["KH", `${r.nutrition.carbs} g`], ["Protein", `${r.nutrition.protein} g`]].map(([k, v]) => (
                <div key={String(k)} className="rounded-[10px] border border-line p-3"><dd className="text-lg">{v}</dd><dt className="text-[10px] uppercase tracking-wider text-ink-muted">{k}</dt></div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="container-x pb-20">
          <SectionHeading eyebrow={t("eyebrow")} title={t("similar")} />
          <div className="mt-10 grid gap-6 md:grid-cols-3">{similar.map((x) => <RecipeCard key={x.slug} r={x} locale={locale} />)}</div>
        </section>
      )}
    </article>
  );
}
