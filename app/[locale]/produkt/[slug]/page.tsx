import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/brand/breadcrumbs";
import { Cta } from "@/components/brand/cta";
import { Badges } from "@/components/commerce/badges";
import { PriceTag } from "@/components/commerce/price-tag";
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
import { formatBasePrice, formatPrice, formatWeight } from "@/lib/format";
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


const TRIGGER = "display rounded-none py-4 text-lg font-[number:var(--fw-display)] text-ink hover:no-underline";

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
  // Weight semantics (§4.39): weight-based items read „ca. 400 g · 3,99 € / 1 kg"; piece-based items read their unit label.
  const weightBased = /^(kg|g|l)$/i.test(p.unit.unit);
  const weightCopy = weightBased ? `${t("approx")} ${formatWeight(p.weightGrams, locale)} · ${formatBasePrice(card.basePrice.amount, card.basePrice.per, locale)}` : card.unitLabel;
  const prefix = locale === "en" ? "/en" : "";

  const ld = {
    "@context": "https://schema.org", "@type": "Product", name: card.name, description: tx(p.origin.story, locale), sku: p.sku, image: `${settings.brand.siteUrl}${p.images[0].src}`,
    brand: { "@type": "Brand", name: producer?.name ?? "REWE" },
    offers: { "@type": "Offer", priceCurrency: "EUR", price: card.price, availability: "https://schema.org/InStock", url: `${settings.brand.siteUrl}${prefix}/produkt/${p.slug}`, seller: { "@type": "Organization", name: settings.brand.merchantLegal } },
  };
  const nutritionRows: [string, string][] = [
    [t("kcal"), `${p.nutrition.kcal} kcal`], [t("fat"), `${p.nutrition.fat} g`], [t("carbs"), `${p.nutrition.carbs} g`], [t("sugar"), `${p.nutrition.sugar} g`], [t("protein"), `${p.nutrition.protein} g`], [t("salt"), `${p.nutrition.salt} g`],
  ];

  return (
    <article>
      <JsonLd data={ld} />
      <div className="container-x pt-10 md:pt-14">
        <Breadcrumbs className="rule-b pb-4" items={[{ label: tn("home"), href: "/" }, { label: tn("categories"), href: "/kategorien" }, ...(cat ? [{ label: tx(cat.name, locale), href: `/kategorien/${cat.slug}` }] : []), { label: card.name }]} />
      </div>

      <section className="container-x grid gap-10 py-10 lg:grid-cols-12 lg:gap-x-6">
        {/* Gallery — below lg its width is capped so the 4:5 plate stays ≤ 70svh and the h1 + buy box follow right after */}
        <div className="lg:col-span-7">
          <div className="mx-auto w-full max-w-[56svh] lg:mx-0 lg:max-w-none">
            <ProductGallery images={gallery} />
          </div>
        </div>

        {/* Sticky buy rail (§4.39) — second in DOM order; spans both grid rows on lg so it stays sticky beside the accordion */}
        <div className="flex flex-col gap-5 self-start lg:sticky lg:top-[88px] lg:col-span-5 lg:row-span-2">
          <Badges badges={p.badges} discount={card.discount} size="md" />
          <div>
            <p className="eyebrow">{t("eyebrow")} · {t("sku")} {p.sku}</p>
            <h1 className="mt-3 text-[clamp(2rem,3.4vw,3.25rem)] leading-[1.02] tracking-[-0.025em] text-ink">{card.name}</h1>
            <p className="mt-3 text-lg text-ink-muted">{card.subtitle} · <span className="num">{weightCopy}</span></p>
          </div>
          <Rating value={p.rating} count={p.reviews} />
          <div>
            <PriceTag price={card.price} oldPrice={card.oldPrice} basePrice={card.basePrice} pfand={card.pfand || undefined} size="lg" />
            {card.pfand > 0 && <p className="mt-2 text-[13px] text-ink-muted">{t("pfandNote", { amount: formatPrice(card.pfand, locale) })}</p>}
          </div>
          <p className="text-[13px] font-medium text-ink">{t("availableIn")}</p>
          <BuyBox p={card} />
        </div>

        {/* Herkunft · Nährwerte · Frischegarantie — after the rail in DOM order, back under the gallery on lg */}
        <div className="lg:col-span-7 lg:col-start-1 lg:row-start-2">
          <h2 className="sr-only">{t("origin")} · {t("nutritionTitle")}</h2>
          <Accordion type="single" collapsible defaultValue="origin" className="border-t border-line lg:mt-2">
            <AccordionItem value="origin" className="border-line">
              <AccordionTrigger className={TRIGGER}>{t("origin")}</AccordionTrigger>
              <AccordionContent className="pb-5 text-base text-ink-2">
                <p>{tx(p.origin.story, locale)}</p>
                {producer && <p className="mt-3 text-[13px] text-ink-muted">{producer.name} · {tx(producer.region, locale)} · {t("producerDistance", { km: producer.distanceKm })}</p>}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="nutrition" className="border-line">
              <AccordionTrigger className={TRIGGER}>{t("nutritionTitle")}</AccordionTrigger>
              <AccordionContent className="pb-5">
                <table className="num w-full text-sm">
                  <tbody className="divide-y divide-line">
                    {nutritionRows.map(([k, v]) => <tr key={k}><th scope="row" className="py-2.5 text-left font-normal text-ink-muted">{k}</th><td className="py-2.5 text-right text-ink">{v}</td></tr>)}
                  </tbody>
                </table>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="fresh" className="border-line">
              <AccordionTrigger className={TRIGGER}>{t("freshness")}</AccordionTrigger>
              <AccordionContent className="pb-5 text-base text-ink-2">{t("freshnessText")}</AccordionContent>
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
        <section className="bg-surface py-16 md:py-24">
          <div className="container-x grid items-center gap-10 md:grid-cols-12 md:gap-x-6">
            <Reveal className="frame relative aspect-[4/5] overflow-hidden bg-surface-2 md:col-span-5">
              <SmartImage src={producer.image.src} alt={tx(producer.image.alt, locale)} blur={getBlur(producer.image.src)} fill sizes="(max-width:768px) 100vw, 40vw" className="img-grade object-cover" />
            </Reveal>
            <div className="md:col-span-7">
              <SectionHeading eyebrow={t("storyEyebrow")} title={producer.name} text={tx(producer.story, locale)}>
                <p className="mt-6 text-[13px] text-ink-muted">{tx(producer.region, locale)} · {t("producerDistance", { km: producer.distanceKm })}</p>
              </SectionHeading>
            </div>
          </div>
        </section>
      )}

      {recipes.length > 0 && (
        <section className="container-x py-16 md:py-24">
          <SectionHeading eyebrow={tn("recipes")} title={t("cookWith")} />
          <div className="mt-10 grid gap-x-6 gap-y-10 md:grid-cols-3">{recipes.map((r) => <RecipeCard key={r!.slug} r={r!} locale={locale} />)}</div>
        </section>
      )}

      {similar.length > 0 && (
        <section className="container-x pb-20">
          <SectionHeading
            eyebrow={cat ? tx(cat.name, locale) : undefined}
            title={t("similar")}
            aside={cat ? <Cta href={`/kategorien/${cat.slug}`} variant="ghost" size="sm" className="px-0">{tc("showAll")}</Cta> : undefined}
          />
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">{similar.map((x) => <ProductCard key={x.slug} p={x} />)}</div>
        </section>
      )}
    </article>
  );
}
