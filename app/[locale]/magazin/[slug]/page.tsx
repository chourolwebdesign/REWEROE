import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/brand/breadcrumbs";
import { SectionHeading } from "@/components/brand/section-heading";
import { RecipeCard } from "@/components/cards/recipe-card";
import { ArticleCard } from "@/components/cards/article-card";
import { SmartImage } from "@/components/ui/smart-image";
import { JsonLd } from "@/components/seo/json-ld";
import { Markdown } from "@/lib/markdown";
import { getBlur } from "@/lib/blur";
import { tx } from "@/lib/l10n";
import { formatDate } from "@/lib/format";
import { getArticle, getArticles, getRecipe, getSettings } from "@/lib/content";

export function generateStaticParams() { return getArticles().map((a) => ({ slug: a.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const a = getArticle(slug);
  return a ? { alternates: alternatesFor(locale, `/magazin/${slug}`), title: tx(a.title, locale), description: tx(a.excerpt, locale), openGraph: { type: "article", images: [a.cover.src], publishedTime: a.publishedAt } } : {};
}

export default async function ArticlePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const a = getArticle(slug);
  if (!a) notFound();
  const t = await getTranslations("magazine");
  const tn = await getTranslations("nav");
  const settings = getSettings();
  const recipes = a.relatedRecipes.map((r) => getRecipe(r)).filter(Boolean);
  const more = getArticles().filter((x) => x.slug !== a.slug).slice(0, 3);
  const ld = { "@context": "https://schema.org", "@type": "Article", headline: tx(a.title, locale), description: tx(a.excerpt, locale), image: `${settings.brand.siteUrl}${a.cover.src}`, datePublished: a.publishedAt, author: { "@type": "Organization", name: a.author.name }, publisher: { "@type": "Organization", name: settings.brand.merchantLegal } };

  return (
    <article>
      <JsonLd data={ld} />
      <section data-header-theme="dark" className="relative isolate overflow-hidden bg-forest text-cream">
        <div className="absolute inset-0 -z-10"><SmartImage src={a.cover.src} alt={tx(a.cover.alt, locale)} blur={getBlur(a.cover.src)} fill priority sizes="100vw" className="object-cover opacity-60" /><div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/60 to-forest/20" /></div>
        <div className="container-x flex min-h-[64svh] flex-col justify-end pb-16 pt-32">
          <Breadcrumbs inverse className="mb-6" items={[{ label: tn("home"), href: "/" }, { label: tn("magazine"), href: "/magazin" }, { label: tx(a.title, locale) }]} />
          <p className="eyebrow mb-4">{t(`category.${a.category}`)} · {t("readTime", { n: a.readMinutes })}</p>
          <h1 className="max-w-4xl text-cream">{tx(a.title, locale)}</h1>
          <p className="mono mt-6 text-[11px] uppercase tracking-[0.16em] text-cream/70">{t("by")} {a.author.status === "pending" ? t("authorPending") : a.author.name} · {formatDate(a.publishedAt, locale)}</p>
        </div>
      </section>

      <section className="container-x py-16">
        <div className="mx-auto max-w-[68ch]">
          <p className="serif text-2xl leading-snug text-forest dark:text-cream">{tx(a.excerpt, locale)}</p>
          <div className="gold-line my-10" />
          <Markdown source={tx(a.body, locale)} className="prose-editorial" />
        </div>
      </section>

      {recipes.length > 0 && (
        <section className="container-x pb-16">
          <SectionHeading eyebrow={tn("recipes")} title={t("related")} />
          <div className="mt-10 grid gap-6 md:grid-cols-3">{recipes.map((r) => <RecipeCard key={r!.slug} r={r!} locale={locale} />)}</div>
        </section>
      )}
      <section className="container-x pb-24">
        <SectionHeading eyebrow={t("eyebrow")} title={t("more")} />
        <div className="mt-10 grid gap-6 md:grid-cols-3">{more.map((x) => <ArticleCard key={x.slug} a={x} locale={locale} />)}</div>
      </section>
    </article>
  );
}
