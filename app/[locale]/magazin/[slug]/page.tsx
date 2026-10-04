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
import { cn } from "@/lib/utils";
import { getArticle, getArticles, getRecipe, getSettings } from "@/lib/content";
import type { Img } from "@/lib/content/types";

export function generateStaticParams() { return getArticles().map((a) => ({ slug: a.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const a = getArticle(slug);
  return a ? { alternates: alternatesFor(locale, `/magazin/${slug}`), title: tx(a.title, locale), description: tx(a.excerpt, locale), openGraph: { type: "article", images: [a.cover.src], publishedTime: a.publishedAt } } : {};
}

/** Frame aspect per declared image ratio (§6); real event photos are 3:2. */
const RATIO: Record<NonNullable<Img["ratio"]>, string> = { "4:5": "aspect-[4/5]", "16:9": "aspect-video", "1:1": "aspect-square", "3:2": "aspect-[3/2]" };
const ratioClass = (r?: Img["ratio"]) => RATIO[r ?? "3:2"];

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
  const gallery = a.gallery ?? [];
  const hasMedia = gallery.length > 0 || Boolean(a.video);
  const ld = { "@context": "https://schema.org", "@type": "Article", headline: tx(a.title, locale), description: tx(a.excerpt, locale), image: `${settings.brand.siteUrl}${a.cover.src}`, datePublished: a.publishedAt, author: { "@type": "Organization", name: a.author.name }, publisher: { "@type": "Organization", name: settings.brand.merchantLegal } };

  return (
    <article>
      <JsonLd data={ld} />
      {/* Editorial hero (§4.37) — ink scrim, white type; the header above stays opaque paper */}
      <section className="on-block relative isolate overflow-hidden">
        <SmartImage src={a.cover.src} alt={tx(a.cover.alt, locale)} blur={getBlur(a.cover.src)} fill priority sizes="100vw" className="img-grade absolute inset-0 -z-10 object-cover" />
        <div className="scrim-editorial absolute inset-0 -z-10" aria-hidden />
        <div className="container-x flex min-h-[60svh] flex-col justify-end pb-14 pt-16">
          {/* The current crumb (the article title) is truncated on phones so the trail stays one line */}
          <Breadcrumbs inverse className="mb-6 [&_[aria-current]]:max-w-[60vw] [&_[aria-current]]:truncate md:[&_[aria-current]]:max-w-none" items={[{ label: tn("home"), href: "/" }, { label: tn("magazine"), href: "/magazin" }, { label: tx(a.title, locale) }]} />
          <p className="eyebrow text-block-muted">{t(`category.${a.category}`)} · {t("readTime", { n: a.readMinutes })}</p>
          <h1 className="mt-4 max-w-[14ch] text-block-ink">{tx(a.title, locale)}</h1>
          <p className="num mt-8 border-t border-block-line pt-3 text-[13px] text-block-ink/80">{t("by")} {a.author.status === "pending" ? t("authorPending") : a.author.name} · {formatDate(a.publishedAt, locale)}</p>
        </div>
      </section>

      <section className="container-x py-16">
        <div className="mx-auto max-w-[68ch]">
          <p className="display text-2xl leading-snug text-ink">{tx(a.excerpt, locale)}</p>
          <div className="rule my-10" />
          <Markdown source={tx(a.body, locale)} className="prose-editorial" />
        </div>
      </section>

      {/* Real media from the store (gallery + vertical clip): framed, graded, captioned — never text on the photo, never autoplay */}
      {hasMedia && (
        <section className="container-x pb-16">
          <p className="eyebrow eyebrow-rule mb-6">{t("galleryEyebrow")}</p>
          <div className="grid items-start gap-6 md:grid-cols-12">
            {a.video && (
              <figure className="md:col-span-5 lg:col-span-4">
                <div className="frame mx-auto aspect-[9/16] max-w-[420px] overflow-hidden bg-surface md:mx-0">
                  {/* The clip has no soundtrack: `muted` + a one-sentence description linked via aria-describedby */}
                  <video controls muted playsInline preload="none" poster={a.video.poster} className="h-full w-full object-cover" aria-label={a.video.caption ? tx(a.video.caption, locale) : t("videoEyebrow")} aria-describedby={`article-video-desc-${a.slug}`}>
                    <source src={a.video.src} type="video/mp4" />
                  </video>
                </div>
                <figcaption className="mx-auto mt-2 max-w-[420px] md:mx-0">
                  <span className="data block text-ink-muted">{t("videoEyebrow")}{a.video.caption ? ` · ${tx(a.video.caption, locale)}` : ""}</span>
                  <span id={`article-video-desc-${a.slug}`} className="mt-1 block text-[12px] leading-relaxed text-ink-muted">{t("videoDescription")}</span>
                </figcaption>
              </figure>
            )}
            {gallery.length > 0 && (
              <div className={cn("grid gap-6 sm:grid-cols-2", a.video ? "md:col-span-7 lg:col-span-8" : "md:col-span-12")}>
                {gallery.map((img, i) => (
                  <figure key={img.src} className={cn(a.video && i === 0 && "sm:col-span-2")}>
                    <div className={cn("frame relative overflow-hidden bg-surface", ratioClass(img.ratio))}>
                      <SmartImage src={img.src} alt={tx(img.alt, locale)} blur={getBlur(img.src)} fill sizes={a.video && i === 0 ? "(max-width:768px) 100vw, 60vw" : "(max-width:640px) 100vw, 33vw"} className="img-grade object-cover" />
                    </div>
                    <figcaption className="data mt-2 text-ink-muted">{tx(img.alt, locale)}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {recipes.length > 0 && (
        <section className="container-x pb-16">
          <SectionHeading eyebrow={tn("recipes")} title={t("related")} />
          <div className="mt-10 grid gap-x-6 gap-y-10 md:grid-cols-3">{recipes.map((r) => <RecipeCard key={r!.slug} r={r!} locale={locale} />)}</div>
        </section>
      )}
      <section className="container-x pb-24">
        <SectionHeading eyebrow={t("eyebrow")} title={t("more")} />
        <div className="mt-10 grid gap-x-6 gap-y-10 md:grid-cols-3">{more.map((x) => <ArticleCard key={x.slug} a={x} locale={locale} />)}</div>
      </section>
    </article>
  );
}
