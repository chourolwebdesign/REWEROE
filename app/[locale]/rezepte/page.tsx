import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/brand/page-hero";
import { RecipeCard } from "@/components/cards/recipe-card";
import { RecipeFilter } from "@/components/commerce/recipe-filter";
import { SmartImage } from "@/components/ui/smart-image";
import { Reveal } from "@/components/motion/reveal";
import { Cta } from "@/components/brand/cta";
import { getBlur } from "@/lib/blur";
import { tx } from "@/lib/l10n";
import { getFeaturedRecipe, getRecipes } from "@/lib/content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "recipes" });
  return { title: t("title"), description: t("text") };
}

export default async function RecipesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("recipes");
  const tc = await getTranslations("common");
  const recipes = getRecipes();
  const featured = getFeaturedRecipe();
  const cards: Record<string, React.ReactNode> = {};
  for (const r of recipes) cards[r.slug] = <RecipeCard r={r} locale={locale} />;

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} text={t("text")} image="/images/placeholders/hero-rezepte.jpg" />

      {/* Rezept des Monats */}
      <section className="container-x -mt-10 md:-mt-16">
        <Reveal className="grid overflow-hidden rounded-[16px] bg-card shadow-lift md:grid-cols-[1.3fr_1fr]">
          <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[460px]">
            <SmartImage src={featured.image.src} alt={tx(featured.image.alt, locale)} blur={getBlur(featured.image.src)} fill priority sizes="(max-width:768px) 100vw, 60vw" className="object-cover" />
          </div>
          <div className="flex flex-col justify-center p-8 md:p-12">
            <p className="eyebrow mb-4">{t("monthEyebrow")}</p>
            <h2 className="text-forest dark:text-cream">{tx(featured.title, locale)}</h2>
            <p className="mt-4 text-ink-muted">{tx(featured.teaser, locale)}</p>
            <p className="mono mt-6 text-[11px] uppercase tracking-wider text-ink-muted">{tc("minutes", { n: featured.time })} · {tc("servings", { n: featured.servings })} · {tc(`difficulty.${featured.difficulty}`)}</p>
            <Cta href={`/rezepte/${featured.slug}`} className="mt-8 self-start">{t("monthCta")}</Cta>
          </div>
        </Reveal>
      </section>

      <section className="container-x py-20">
        <RecipeFilter recipes={recipes.map((r) => ({ slug: r.slug, time: r.time, difficulty: r.difficulty, season: r.season, diet: r.diet }))} cards={cards} />
      </section>
    </>
  );
}
