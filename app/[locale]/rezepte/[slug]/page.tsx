import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/brand/breadcrumbs";
import { BulkIngredients, type IngredientVM } from "@/components/signature/bulk-ingredients";
import { RecipeCard } from "@/components/cards/recipe-card";
import { SectionHeading } from "@/components/brand/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SmartImage } from "@/components/ui/smart-image";
import { JsonLd } from "@/components/seo/json-ld";
import { getBlur } from "@/lib/blur";
import { tx } from "@/lib/l10n";
import { formatNumber } from "@/lib/format";
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
  const dietLabels = r.diet.map((d) => tc(`diet.${d}`));
  const rating = formatNumber(r.rating, locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const ld = {
    "@context": "https://schema.org", "@type": "Recipe", name: tx(r.title, locale), description: tx(r.teaser, locale), image: `${settings.brand.siteUrl}${r.image.src}`,
    author: { "@type": "Organization", name: settings.brand.merchant }, totalTime: `PT${r.time}M`, recipeYield: `${r.servings}`, recipeCategory: tc(`season.${r.season}`),
    recipeIngredient: r.ingredients.map((i) => `${i.amount} ${i.unit} ${tx(i.name, locale)}`), recipeInstructions: r.steps.map((s) => ({ "@type": "HowToStep", text: tx(s, locale) })),
    nutrition: { "@type": "NutritionInformation", calories: `${r.nutrition.kcal} kcal` }, aggregateRating: { "@type": "AggregateRating", ratingValue: r.rating, reviewCount: 40 },
    suitableForDiet: r.diet.includes("vegan") ? "https://schema.org/VeganDiet" : r.diet.includes("vegetarisch") ? "https://schema.org/VegetarianDiet" : undefined,
  };

  const meta: [string, string][] = [
    [t("filterTime"), tc("minutes", { n: r.time })],
    [t("servingsLabel"), String(r.servings)],
    [t("filterDifficulty"), tc(`difficulty.${r.difficulty}`)],
    [t("ratingLabel"), `★ ${rating}`],
  ];
  const nutrition: [string, string][] = [
    [t("nutritionKcal"), `${r.nutrition.kcal} kcal`], [t("nutritionFat"), `${r.nutrition.fat} g`], [t("nutritionCarbs"), `${r.nutrition.carbs} g`], [t("nutritionProtein"), `${r.nutrition.protein} g`],
  ];

  return (
    <article>
      <JsonLd data={ld} />
      {/* Editorial hero (§4.37) — the only text-on-photo: ink scrim, white type, meta strip as data */}
      <section className="on-block relative isolate overflow-hidden">
        <SmartImage src={r.image.src} alt={tx(r.image.alt, locale)} blur={getBlur(r.image.src)} fill priority sizes="100vw" className="img-grade absolute inset-0 -z-10 object-cover" />
        <div className="scrim-editorial absolute inset-0 -z-10" aria-hidden />
        <div className="container-x flex min-h-[60svh] flex-col justify-end pb-14 pt-16">
          <Breadcrumbs inverse className="mb-6" items={[{ label: tn("home"), href: "/" }, { label: tn("recipes"), href: "/rezepte" }, { label: tx(r.title, locale) }]} />
          <p className="eyebrow text-block-muted">{tc(`season.${r.season}`)}{dietLabels.length ? ` · ${dietLabels.join(" · ")}` : ""}</p>
          <h1 className="mt-4 max-w-[14ch] text-block-ink">{tx(r.title, locale)}</h1>
          <p className="mt-5 max-w-2xl text-lg text-block-ink/90">{tx(r.teaser, locale)}</p>
          <dl className="mt-8 grid grid-cols-2 gap-y-4 border-t border-block-line pt-3 md:grid-cols-4 md:divide-x md:divide-block-line">
            {meta.map(([k, v]) => (
              <div key={k} className="md:px-4 md:first:pl-0">
                <dt className="data text-block-muted">{k}</dt>
                <dd className="num mt-1 text-[15px] text-block-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Body (§4.38): sticky ingredients · numbered steps · tip · nutrition */}
      <section className="container-x grid grid-cols-4 gap-x-6 gap-y-12 py-16 md:grid-cols-12">
        <div className="col-span-4 self-start md:sticky md:top-24 md:col-span-5 lg:col-span-4">
          <Reveal><BulkIngredients ingredients={ingredients} servings={r.servings} /></Reveal>
        </div>
        <div className="col-span-4 md:col-span-7 lg:col-span-7 lg:col-start-6">
          <p className="eyebrow">{t("steps")}</p>
          <Stagger className="mt-2 space-y-6">
            {r.steps.map((s, i) => (
              <StaggerItem key={i} className="rule grid grid-cols-[3.5rem_1fr] gap-4 pt-6">
                <span className="display text-[2.5rem] leading-none tracking-[-0.03em] tabular-nums text-red-text" aria-label={t("step", { n: i + 1 })}>{String(i + 1).padStart(2, "0")}</span>
                <p className="pt-1 text-lg leading-relaxed text-ink-2">{tx(s, locale)}</p>
              </StaggerItem>
            ))}
          </Stagger>
          {r.tips.length > 0 && (
            <Reveal className="rule-strong mt-12 pt-5">
              <p className="eyebrow mb-3">{t("tips")}</p>
              {r.tips.map((tip, i) => <p key={i} className="display text-xl leading-snug text-ink">{tx(tip, locale)}</p>)}
            </Reveal>
          )}
          <Reveal className="mt-12">
            <p className="eyebrow mb-3">{t("nutrition")}</p>
            <dl className="grid grid-cols-4 divide-x divide-line border-y border-line">
              {nutrition.map(([k, v]) => (
                <div key={k} className="px-3 py-4 first:pl-0 md:px-4">
                  <dd className="num text-lg text-ink">{v}</dd>
                  <dt className="eyebrow mt-1.5">{k}</dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="container-x pb-20">
          <SectionHeading eyebrow={t("eyebrow")} title={t("similar")} />
          <div className="mt-10 grid gap-x-6 gap-y-10 md:grid-cols-3">{similar.map((x) => <RecipeCard key={x.slug} r={x} locale={locale} />)}</div>
        </section>
      )}
    </article>
  );
}
