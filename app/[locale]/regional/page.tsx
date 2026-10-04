import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { alternatesFor } from "@/lib/seo";
import { PageHero } from "@/components/brand/page-hero";
import { SectionHeading } from "@/components/brand/section-heading";
import { Eyebrow } from "@/components/brand/eyebrow";
import { Cta } from "@/components/brand/cta";
import { BrandLockup, RegionSign } from "@/components/brand/brand-lockup";
import { ProductCard } from "@/components/commerce/product-card";
import { ProducerMap } from "@/components/worlds/producer-map";
import { SeasonCalendar } from "@/components/worlds/season-calendar";
import { WorldFaq } from "@/components/worlds/world-faq";
import { StoreChip } from "@/components/signature/store-chip";
import { JsonLd } from "@/components/seo/json-ld";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SmartImage } from "@/components/ui/smart-image";
import { getBlur } from "@/lib/blur";
import { tx } from "@/lib/l10n";
import { formatNumber } from "@/lib/format";
import { toCardProduct } from "@/lib/view-models";
import { getPrimaryStore, getRegionalPage, getRegionalProducers, getRegionalProducts, getSettings, REGIONAL_RADIUS_KM } from "@/lib/content";

const PATH = "/regional";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "regional" });
  const r = getRegionalPage();
  return { alternates: alternatesFor(locale, PATH), title: t("metaTitle"), description: t("metaDescription"), openGraph: { images: [r.hero.image.src] } };
}

/** REWE Regional world page: hero with the sub-brand marks, promises, Erzeuger map, products, season heatmap, Regionalfenster, FAQ, CTA block. */
export default async function RegionalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("regional");
  const tn = await getTranslations("nav");
  const r = getRegionalPage();
  const settings = getSettings();
  const store = getPrimaryStore();
  const producers = getRegionalProducers();
  /** Farms outside the store (map copy says „plus Bäckerei und Metzgerei im Markt“); the headline count is the canonical `getRegionalProducers().length`. */
  const farms = producers.filter((p) => p.distanceKm > 0);
  const products = getRegionalProducts();
  const cards = products.slice(0, 8).map((p) => toCardProduct(p, locale));

  const base = settings.brand.siteUrl;
  const prefix = locale === "en" ? "/en" : "";
  const ld = [
    {
      "@context": "https://schema.org", "@type": "CollectionPage", name: t("metaTitle"), description: t("metaDescription"), url: `${base}${prefix}${PATH}`, inLanguage: locale,
      isPartOf: { "@type": "WebSite", url: base }, primaryImageOfPage: `${base}${r.hero.image.src}`,
      mainEntity: { "@type": "ItemList", numberOfItems: products.length, itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: tx(p.name, locale), url: `${base}${prefix}/produkt/${p.slug}` })) },
    },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: r.faq.map((f) => ({ "@type": "Question", name: tx(f.q, locale), acceptedAnswer: { "@type": "Answer", text: tx(f.a, locale) } })) },
  ];

  const proof = [
    { label: t("proofProducers"), value: formatNumber(producers.length, locale) },
    { label: t("proofRadius"), value: t("proofRadiusValue", { km: REGIONAL_RADIUS_KM }) },
    { label: t("proofLabel"), value: t("proofLabelValue") },
    { label: t("proofRegion"), value: t("proofRegionValue") },
  ];

  return (
    <>
      <JsonLd data={ld} />

      {/* Hero: the two REWE Regional marks (brand lockup + shelf sign) open the eyebrow row; plate under the head row, proof strip beneath */}
      <PageHero
        eyebrow={
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <BrandLockup sub="regional" size="lg" />
            <RegionSign height={48} />
          </div>
        }
        title={tx(r.hero.title, locale)}
        text={tx(r.hero.lead, locale)}
        image={r.hero.image.src}
        imageAlt={tx(r.hero.image.alt, locale)}
        breadcrumbs={[{ label: tn("home"), href: "/" }, { label: t("breadcrumb") }]}
      >
        <dl className="grid grid-cols-2 gap-px border-b border-line bg-line md:grid-cols-4">
          {proof.map((cell) => (
            <div key={cell.label} className="bg-paper px-4 py-4 odd:pl-0 md:odd:pl-4 md:first:pl-0">
              <dt className="eyebrow">{cell.label}</dt>
              <dd className="num mt-1 text-[20px] font-bold leading-none text-ink">{cell.value}</dd>
            </div>
          ))}
        </dl>
      </PageHero>

      {/* Unser Regional-Versprechen — four numbered fields; the numerals are the section's only red */}
      <section className="container-x py-20 md:py-28">
        <SectionHeading eyebrow={t("promisesEyebrow")} title={t("promisesTitle")} text={t("promisesText")} />
        <Stagger className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {r.promises.map((p, i) => (
            <StaggerItem key={p.id} className="rule pt-6">
              <Eyebrow num={String(i + 1).padStart(2, "0")}>{t("promiseLabel")}</Eyebrow>
              <h3 className="mt-4 text-ink">{tx(p.title, locale)}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{tx(p.text, locale)}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Erzeuger — map + list, then the producer card grid */}
      <section className="container-x pb-20 md:pb-28">
        <SectionHeading eyebrow={t("producersEyebrow")} title={t("producersTitle")} text={t("producersText", { n: farms.length, km: REGIONAL_RADIUS_KM })} />
        <Reveal className="mt-12">
          <ProducerMap
            store={{ name: store.name, coords: store.coords }}
            radiusKm={REGIONAL_RADIUS_KM}
            producers={producers.map((p) => ({ slug: p.slug, name: p.name, region: tx(p.region, locale), distanceKm: p.distanceKm, coords: p.coords, inStore: p.distanceKm === 0 }))}
          />
        </Reveal>
        <Stagger className="mt-16 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-5">
          {producers.map((p) => (
            <StaggerItem key={p.slug}>
              <article className="group flex h-full flex-col">
                <div className="frame relative aspect-[4/5] overflow-hidden bg-surface">
                  <SmartImage src={p.image.src} alt={tx(p.image.alt, locale)} blur={getBlur(p.image.src)} fill sizes="(max-width:768px) 50vw, (max-width:1024px) 33vw, 20vw" className="img-zoom img-grade object-cover" />
                </div>
                <div className="rule mt-4 flex items-baseline justify-between gap-3 pt-3">
                  <h3 className="font-sans text-[15px] font-semibold leading-snug tracking-normal text-ink">{p.name}</h3>
                  <span className="num shrink-0 text-[13px] text-ink">{p.distanceKm === 0 ? t("inStore") : t("km", { km: p.distanceKm })}</span>
                </div>
                <p className="mt-1 text-[12px] font-medium text-ink-muted">{tx(p.region, locale)}</p>
                <p className="mt-3 line-clamp-3 text-[14px] leading-relaxed text-ink-2">{tx(p.story, locale)}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Regionale Produkte — surface band, yellow square eyebrow, the page's one primary CTA */}
      <section className="bg-surface py-20 md:py-28">
        <div className="container-x">
          <SectionHeading regional eyebrow={t("productsEyebrow")} title={t("productsTitle")} text={t("productsText", { n: products.length })} />
          <Stagger className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
            {cards.map((p) => <StaggerItem key={p.slug}><ProductCard p={p} /></StaggerItem>)}
          </Stagger>
          <div className="rule mt-12 flex flex-wrap items-center justify-between gap-4 pt-8">
            <p className="num text-[15px] text-ink-muted">{t("productsCount", { n: products.length })}</p>
            <Cta href="/kategorien/alle?herkunft=regional">{t("productsAll")}</Cta>
          </div>
        </div>
      </section>

      {/* Saisonkalender Hessen — num heatmap, current month opened by the red rule */}
      <section className="container-x py-20 md:py-28">
        <SectionHeading eyebrow={t("seasonEyebrow")} title={t("seasonTitle")} text={t("seasonText")} />
        <Reveal className="mt-12">
          <SeasonCalendar rows={r.seasonCalendar.map((s) => ({ id: s.id, item: tx(s.item, locale), months: s.months }))} />
          <p className="mt-6 max-w-[64ch] text-[13px] leading-relaxed text-ink-muted">{tx(r.seasonNote, locale)}</p>
        </Reveal>
      </section>

      {/* Regionalfenster + Gutes aus Hessen — explainer on a surface band */}
      <section className="bg-surface py-20 md:py-28">
        <div className="container-x grid grid-cols-4 gap-x-6 gap-y-14 md:grid-cols-12">
          <Reveal className="col-span-4 md:col-span-7">
            <figure>
              <div className="frame relative aspect-[16/9] overflow-hidden bg-surface-2">
                <SmartImage src={r.hessen.image.src} alt={tx(r.hessen.image.alt, locale)} blur={getBlur(r.hessen.image.src)} fill sizes="(max-width:768px) 100vw, 60vw" className="img-grade object-cover" />
              </div>
              <figcaption className="data mt-2 text-ink-muted">{tx(r.hessen.image.alt, locale)}</figcaption>
            </figure>
            <div className="rule mt-10 pt-6">
              <Eyebrow>{t("hessenEyebrow")}</Eyebrow>
              <h3 className="mt-4 text-ink">{tx(r.hessen.title, locale)}</h3>
              <p className="mt-3 max-w-[60ch] text-ink-muted">{tx(r.hessen.text, locale)}</p>
            </div>
          </Reveal>
          <Reveal className="col-span-4 md:col-span-4 md:col-start-9">
            <Eyebrow rule>{t("windowEyebrow")}</Eyebrow>
            <h2 className="mt-4 text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] text-ink">{tx(r.regionalfenster.title, locale)}</h2>
            <p className="mt-4 text-ink-muted">{tx(r.regionalfenster.text, locale)}</p>
            <ol className="rule-strong mt-8 divide-y divide-line">
              {r.regionalfenster.points.map((pt, i) => (
                <li key={i} className="flex gap-4 py-4">
                  <span className="display num w-7 shrink-0 text-[15px] leading-relaxed text-red-text">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[15px] leading-relaxed text-ink-2">{tx(pt, locale)}</span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x py-20 md:py-28">
        <SectionHeading eyebrow={t("faqEyebrow")} title={t("faqTitle")} />
        <Reveal className="mt-10 grid grid-cols-4 gap-x-6 md:grid-cols-12">
          <WorldFaq idPrefix="regional" items={r.faq.map((f) => ({ q: tx(f.q, locale), a: tx(f.a, locale) }))} className="col-span-4 md:col-span-9 md:col-start-4" />
        </Reveal>
      </section>

      {/* CTA block — anthracite, live store chip, inverse + secondary (the primary red lives in the products band). `-mb-32` cancels the footer's mt-32 so block meets footer. */}
      <section className="on-block -mb-32 py-20 md:py-28">
        <div className="container-x grid grid-cols-4 items-end gap-x-6 gap-y-10 md:grid-cols-12">
          <div className="col-span-4 md:col-span-7">
            <Eyebrow>{t("ctaEyebrow")}</Eyebrow>
            <h2 className="mt-4 text-ink">{t("ctaTitle")}</h2>
            <p className="mt-4 max-w-[48ch] text-ink-muted">{t("ctaText")}</p>
          </div>
          <div className="col-span-4 flex flex-wrap items-center gap-3 md:col-span-4 md:col-start-9 md:justify-end">
            <StoreChip hours={store.hours} hoursStatus={store.hoursStatus} size="sm" storeSlug={store.slug} />
            <Cta variant="inverse" href="/filialen">{t("ctaStore")}</Cta>
            <Cta variant="secondary" href="/angebote">{t("ctaOffers")}</Cta>
          </div>
        </div>
      </section>
    </>
  );
}
