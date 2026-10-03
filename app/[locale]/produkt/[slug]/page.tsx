import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/components/brand/breadcrumbs";
import { Badges } from "@/components/commerce/badges";
import { PriceTag } from "@/components/commerce/price-tag";
import { PfandChip } from "@/components/commerce/pfand-chip";
import { Rating } from "@/components/commerce/rating";
import { BuyBox } from "@/components/commerce/buy-box";
import { ProductGallery } from "@/components/commerce/product-gallery";
import { ProductCard } from "@/components/commerce/product-card";
import { JourneyMap } from "@/components/signature/journey-map";
import { RecipeCard } from "@/components/cards/recipe-card";
import { SectionHeading } from "@/components/brand/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SmartImage } from "@/components/ui/smart-image";
import { imgVM, getBlur } from "@/lib/blur";
import { tx } from "@/lib/l10n";
import { formatPrice } from "@/lib/format";
import { toCardProduct } from "@/lib/view-models";
import { getCategory, getPrimaryStore, getProducer, getProduct, getProducts, getProductsByCategory, getRecipe, getSettings } from "@/lib/content";

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  return { alternates: alternatesFor(locale, `/produkt/${slug}`), title: tx(p.name, locale), description: `${tx(p.subtitle, locale)} — ${tx(p.origin.story, locale)}`, openGraph: { images: [p.images[0].src] } };
}

export default async function ProductPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const p = getProduct(slug);
  if (!p) notFound();
  const t = await getTranslations("product");
  const tn = await getTranslations("nav");
  const tc = await getTranslations("common");
  const card = toCardProduct(p, locale);
  const cat = getCategory(p.category);
  const producer = getProducer(p.origin.producer);
  const store = getPrimaryStore();
  const settings = getSettings();
  const similar = getProductsByCategory(p.category).filter((x) => x.slug !== p.slug).slice(0, 4).map((x) => toCardProduct(x, locale));
  const recipes = p.recipes.map((r) => getRecipe(r)).filter(Boolean);
  const gallery = [imgVM(p.images[0], card.image.alt), ...(producer ? [imgVM(producer.image, tx(producer.image.alt, locale))] : []), ...(cat ? [imgVM(cat.image, tx(cat.image.alt, locale))] : [])];

  const ld = {
    "@context": "https://schema.org", "@type": "Product", name: card.name, description: tx(p.origin.story, locale), sku: p.sku, image: `${settings.brand.siteUrl}${p.images[0].src}`,
    brand: { "@type": "Brand", name: producer?.name ?? "REWE" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviews },
    offers: { "@type": "Offer", priceCurrency: "EUR", price: card.price, availability: "https://schema.org/InStock", url: `${settings.brand.siteUrl}/produkt/${p.slug}`, seller: { "@type": "Organization", name: settings.brand.merchantLegal } },
  };
  const nutritionRows: [string, string][] = [
    [t("kcal"), `${p.nutrition.kcal} kcal`], [t("fat"), `${p.nutrition.fat} g`], [t("carbs"), `${p.nutrition.carbs} g`], [t("sugar"), `${p.nutrition.sugar} g`], [t("protein"), `${p.nutrition.protein} g`], [t("salt"), `${p.nutrition.salt} g`],
  ];

  return (
    <article className="pt-[72px]">
      <JsonLd data={ld} />
      <div className="container-x pt-8">
        <Breadcrumbs items={[{ label: tn("home"), href: "/" }, { label: tn("categories"), href: "/kategorien" }, ...(cat ? [{ label: tx(cat.name, locale), href: `/kategorien/${cat.slug}` }] : []), { label: card.name }]} />
      </div>

      <section className="container-x grid gap-10 py-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <ProductGallery images={gallery} />
        <div className="flex flex-col gap-6 lg:pt-4">
          <Badges badges={p.badges} discount={card.discount} size="md" />
          <div>
            <p className="eyebrow mb-3">{t("eyebrow")} · {t("sku")} {p.sku}</p>
            <h1 className="text-[clamp(2rem,4vw,3.5rem)] text-forest dark:text-cream">{card.name}</h1>
            <p className="mt-2 text-lg text-ink-muted">{card.subtitle}</p>
          </div>
          <Rating value={p.rating} count={p.reviews} />
          <div className="flex flex-wrap items-end gap-4">
            <PriceTag price={card.price} oldPrice={card.oldPrice} basePrice={card.basePrice} size="lg" />
            {card.pfand > 0 && <PfandChip amount={card.pfand} className="mb-1" />}
          </div>
          {card.pfand > 0 && <p className="mono -mt-3 text-[11px] uppercase tracking-wider text-emerald">{t("pfandNote", { amount: formatPrice(card.pfand, locale) })}</p>}
          <BuyBox p={card} />

          <h2 className="sr-only">{t("origin")} · {t("nutritionTitle")}</h2>
          <Accordion type="single" collapsible defaultValue="origin" className="border-t border-line">
            <AccordionItem value="origin">
              <AccordionTrigger className="serif text-lg">{t("origin")}</AccordionTrigger>
              <AccordionContent className="text-ink-muted">
                <p>{tx(p.origin.story, locale)}</p>
                {producer && <p className="mono mt-3 text-[11px] uppercase tracking-wider">{producer.name} · {tx(producer.region, locale)} · {t("producerDistance", { km: producer.distanceKm })}</p>}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="nutrition">
              <AccordionTrigger className="serif text-lg">{t("nutritionTitle")}</AccordionTrigger>
              <AccordionContent>
                <table className="mono w-full text-sm"><tbody>
                  {nutritionRows.map(([k, v]) => <tr key={k} className="border-b border-line/60 last:border-0"><th scope="row" className="py-2 text-left font-normal text-ink-muted">{k}</th><td className="py-2 text-right">{v}</td></tr>)}
                </tbody></table>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="fresh">
              <AccordionTrigger className="serif text-lg">{t("freshness")}</AccordionTrigger>
              <AccordionContent className="text-ink-muted">{t("freshnessText")}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Signature: Produktreise */}
      {producer && (
        <section className="container-x py-12 md:py-20">
          <Reveal>
            <JourneyMap
              from={producer.coords} to={store.coords}
              fromLabel={producer.distanceKm === 0 ? store.name : `${producer.name}`} toLabel={store.address.district}
              distanceKm={producer.distanceKm} story={tx(producer.story, locale)}
              international={producer.international} local={producer.distanceKm === 0}
            />
          </Reveal>
        </section>
      )}

      {/* Producer story strip */}
      {producer && producer.distanceKm > 0 && (
        <section className="bg-surface-2/60 py-16  md:py-24">
          <div className="container-x grid items-center gap-10 md:grid-cols-[1fr_1.2fr]">
            <Reveal className="relative aspect-[4/5] overflow-hidden rounded-[14px]"><SmartImage src={producer.image.src} alt={tx(producer.image.alt, locale)} blur={getBlur(producer.image.src)} fill sizes="(max-width:768px) 100vw, 40vw" className="object-cover" /></Reveal>
            <SectionHeading eyebrow={t("storyEyebrow")} title={producer.name} text={tx(producer.story, locale)}>
              <p className="mono mt-6 text-[11px] uppercase tracking-wider text-ink-muted">{tx(producer.region, locale)} · {t("producerDistance", { km: producer.distanceKm })}</p>
            </SectionHeading>
          </div>
        </section>
      )}

      {recipes.length > 0 && (
        <section className="container-x py-16 md:py-24">
          <SectionHeading eyebrow="— Rezepte" title={t("cookWith")} />
          <div className="mt-10 grid gap-6 md:grid-cols-3">{recipes.map((r) => <RecipeCard key={r!.slug} r={r!} locale={locale} />)}</div>
        </section>
      )}

      {similar.length > 0 && (
        <section className="container-x pb-20">
          <div className="flex items-end justify-between gap-4">
            <SectionHeading eyebrow={cat ? tx(cat.name, locale) : ""} title={t("similar")} />
            {cat && <Link href={`/kategorien/${cat.slug}`} className="mono text-[11px] uppercase tracking-widest underline-offset-4 hover:underline">{tc("showAll")} →</Link>}
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">{similar.map((x) => <ProductCard key={x.slug} p={x} />)}</div>
        </section>
      )}
    </article>
  );
}
