import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
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
  return { alternates: alternatesFor(locale, "/rezepte"), title: t("title"), description: t("text") };
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
      <PageHero eyebrow={t("eyebrow")} title={t("title")} text={t("text")} className="pb-0 md:pb-0" />

      {/* Rezept des Monats — the page's photographic plate, framed, no text on it */}
      <section className="container-x py-12 md:py-16">
        <Reveal className="grid items-center gap-x-6 gap-y-8 md:grid-cols-12">
          <Link href={`/rezepte/${featured.slug}`} className="group frame relative block aspect-[3/2] overflow-hidden bg-surface md:col-span-7" aria-label={tx(featured.title, locale)}>
            <SmartImage src={featured.image.src} alt={tx(featured.image.alt, locale)} blur={getBlur(featured.image.src)} fill priority sizes="(max-width:768px) 100vw, 60vw" className="img-zoom img-grade object-cover" />
          </Link>
          <div className="md:col-span-5 lg:col-span-4 lg:col-start-9">
            <p className="eyebrow eyebrow-rule">{t("monthEyebrow")}</p>
            <h2 className="mt-4 text-ink">{tx(featured.title, locale)}</h2>
            <p className="mt-4 text-ink-muted">{tx(featured.teaser, locale)}</p>
            <p className="num mt-6 text-[13px] text-ink-muted">{tc("minutes", { n: featured.time })} · {tc("servings", { n: featured.servings })} · {tc(`difficulty.${featured.difficulty}`)}</p>
            <Cta href={`/rezepte/${featured.slug}`} className="mt-8">{t("monthCta")}</Cta>
          </div>
        </Reveal>
      </section>

      <section className="container-x pb-20">
        <RecipeFilter recipes={recipes.map((r) => ({ slug: r.slug, time: r.time, difficulty: r.difficulty, season: r.season, diet: r.diet }))} cards={cards} />
      </section>
    </>
  );
}
