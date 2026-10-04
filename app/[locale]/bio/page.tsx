import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Check, Leaf, PawPrint, ShieldCheck, Sprout } from "lucide-react";
import { alternatesFor } from "@/lib/seo";
import { PageHero } from "@/components/brand/page-hero";
import { SectionHeading } from "@/components/brand/section-heading";
import { Eyebrow } from "@/components/brand/eyebrow";
import { Cta } from "@/components/brand/cta";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { ProductCard } from "@/components/commerce/product-card";
import { SealsTable } from "@/components/worlds/seals-table";
import { WorldFaq } from "@/components/worlds/world-faq";
import { JsonLd } from "@/components/seo/json-ld";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SmartImage } from "@/components/ui/smart-image";
import { getBlur } from "@/lib/blur";
import { tx } from "@/lib/l10n";
import { formatNumber } from "@/lib/format";
import { toCardProduct } from "@/lib/view-models";
import { getBioPage, getBioProducts, getSettings } from "@/lib/content";

const PATH = "/bio";

/** Green standard icons — the Bio context is the one place the fenced green may colour an icon. */
const ICONS = { eu: Leaf, naturland: ShieldCheck, pesticides: Sprout, animals: PawPrint } as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "bio" });
  const b = getBioPage();
  return { alternates: alternatesFor(locale, PATH), title: t("metaTitle"), description: t("metaDescription"), openGraph: { images: [b.hero.image.src] } };
}

/** REWE Bio world page: hero with the green lockup, standards, seals table, Bio range, green band, shelf editorial, FAQ, CTA block. */
export default async function BioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("bio");
  const tn = await getTranslations("nav");
  const b = getBioPage();
  const settings = getSettings();
  const products = getBioProducts();
  const cards = products.slice(0, 8).map((p) => toCardProduct(p, locale));

  const base = settings.brand.siteUrl;
  const prefix = locale === "en" ? "/en" : "";
  const ld = [
    {
      "@context": "https://schema.org", "@type": "CollectionPage", name: t("metaTitle"), description: t("metaDescription"), url: `${base}${prefix}${PATH}`, inLanguage: locale,
      isPartOf: { "@type": "WebSite", url: base }, primaryImageOfPage: `${base}${b.hero.image.src}`,
      mainEntity: { "@type": "ItemList", numberOfItems: products.length, itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: tx(p.name, locale), url: `${base}${prefix}/produkt/${p.slug}` })) },
    },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: b.faq.map((f) => ({ "@type": "Question", name: tx(f.q, locale), acceptedAnswer: { "@type": "Answer", text: tx(f.a, locale) } })) },
  ];

  const proof = [
    { label: t("proofBasis"), value: t("proofBasisValue") },
    { label: t("proofSeal"), value: t("proofSealValue") },
    { label: t("proofGmo"), value: t("proofGmoValue") },
    { label: t("proofItems"), value: t("proofItemsValue", { n: formatNumber(products.length, locale) }) },
  ];
  const band = [
    { label: t("bandBasis"), value: t("bandBasisValue") },
    { label: t("bandSeal"), value: t("bandSealValue") },
    { label: t("bandGmo"), value: t("bandGmoValue") },
  ];
  const shelf = [t("shelfPoint1"), t("shelfPoint2"), t("shelfPoint3")];

  return (
    <>
      <JsonLd data={ld} />

      {/* Hero: the green REWE Bio field opens the eyebrow row; plate under the head row, proof strip beneath */}
      <PageHero
        eyebrow={<BrandLockup sub="bio" size="lg" className="self-start" />}
        title={tx(b.hero.title, locale)}
        text={tx(b.hero.lead, locale)}
        image={b.hero.image.src}
        imageAlt={tx(b.hero.image.alt, locale)}
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

      {/* Was REWE Bio verspricht — four standards with green icons (no red numerals: red and green never touch) */}
      <section className="container-x py-20 md:py-28">
        <SectionHeading eyebrow={t("standardsEyebrow")} title={t("standardsTitle")} text={t("standardsText")} />
        <Stagger className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {b.standards.map((s) => {
            const Icon = ICONS[s.id as keyof typeof ICONS] ?? Leaf;
            return (
              <StaggerItem key={s.id} className="rule pt-6">
                <Icon className="h-6 w-6 text-bio-text" aria-hidden strokeWidth={1.75} />
                <h3 className="mt-5 text-ink">{tx(s.title, locale)}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{tx(s.text, locale)}</p>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {/* Siegel verstehen — comparison table */}
      <section className="container-x pb-20 md:pb-28">
        <SectionHeading eyebrow={t("sealsEyebrow")} title={t("sealsTitle")} text={t("sealsText")} />
        <Reveal className="mt-12">
          <SealsTable
            columns={b.seals.columns.map((c) => ({ id: c.id, label: c.label, note: tx(c.note, locale), reweBio: c.reweBio }))}
            rows={b.seals.rows.map((r) => ({ id: r.id, criterion: tx(r.criterion, locale), values: r.values.map((v) => tx(v, locale)) }))}
            labels={{ criterion: t("sealsCriterion"), reweBio: t("sealsReweBio"), legend: t("sealsLegend"), table: t("sealsTitle"), scrollHint: t("sealsScrollHint") }}
          />
        </Reveal>
      </section>

      {/* Bio-Sortiment — surface band, the page's one primary CTA */}
      <section className="bg-surface py-20 md:py-28">
        <div className="container-x">
          <SectionHeading eyebrow={t("productsEyebrow")} title={t("productsTitle")} text={t("productsText", { n: products.length })} />
          <Stagger className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
            {cards.map((p) => <StaggerItem key={p.slug}><ProductCard p={p} /></StaggerItem>)}
          </Stagger>
          <div className="rule mt-12 flex flex-wrap items-center justify-between gap-4 pt-8">
            <p className="num text-[15px] text-ink-muted">{t("productsCount", { n: products.length })}</p>
            <Cta href="/kategorien/alle?herkunft=bio">{t("productsAll")}</Cta>
          </div>
        </div>
      </section>

      {/* The one full-width green band — white on --bio (6.62:1), static in dark mode like the lockup; no red here */}
      <section className="bg-bio py-20 text-white md:py-28">
        <div className="container-x grid grid-cols-4 items-end gap-x-6 gap-y-12 md:grid-cols-12">
          <Reveal className="col-span-4 md:col-span-7">
            <p className="font-sans text-[13px] font-semibold leading-none tracking-[0.02em] text-white">{t("bandEyebrow")}</p>
            <h2 className="mt-5 text-white">{tx(b.band.title, locale)}</h2>
            <p className="mt-6 max-w-[52ch] text-[17px] leading-relaxed text-white">{tx(b.band.text, locale)}</p>
          </Reveal>
          <Reveal className="col-span-4 md:col-span-4 md:col-start-9">
            <dl className="divide-y divide-white/30 border-y border-white/30">
              {band.map((cell) => (
                <div key={cell.label} className="flex items-baseline justify-between gap-6 py-4">
                  <dt className="text-[13px] font-medium text-white">{cell.label}</dt>
                  <dd className="num min-w-0 break-words text-right text-[20px] font-bold leading-none text-white">{cell.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* Bio-Regal — framed editorial plate with the three things to look for */}
      <section className="container-x py-20 md:py-28">
        <div className="grid grid-cols-4 gap-x-6 gap-y-10 md:grid-cols-12">
          <Reveal className="col-span-4 md:col-span-8">
            <figure>
              <div className="frame relative aspect-[16/9] overflow-hidden bg-surface">
                <SmartImage src={b.editorial.image.src} alt={tx(b.editorial.image.alt, locale)} blur={getBlur(b.editorial.image.src)} fill sizes="(max-width:768px) 100vw, 66vw" className="img-grade object-cover" />
              </div>
              <figcaption className="data mt-2 text-ink-muted">{tx(b.editorial.image.alt, locale)}</figcaption>
            </figure>
          </Reveal>
          <Reveal className="col-span-4 md:col-span-4 md:self-end">
            <Eyebrow rule>{t("shelfEyebrow")}</Eyebrow>
            <h3 className="mt-4 text-ink">{tx(b.editorial.title, locale)}</h3>
            <p className="mt-3 text-ink-muted">{tx(b.editorial.text, locale)}</p>
            <ul className="rule-strong mt-8 divide-y divide-line">
              {shelf.map((line) => (
                <li key={line} className="flex items-start gap-3 py-3 text-[15px] text-ink-2">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-bio-text" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
            <BrandLockup sub="bio" size="sm" className="mt-8" />
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x pb-20 md:pb-28">
        <SectionHeading eyebrow={t("faqEyebrow")} title={t("faqTitle")} />
        <Reveal className="mt-10 grid grid-cols-4 gap-x-6 md:grid-cols-12">
          <WorldFaq idPrefix="bio" items={b.faq.map((f) => ({ q: tx(f.q, locale), a: tx(f.a, locale) }))} className="col-span-4 md:col-span-9 md:col-start-4" />
        </Reveal>
      </section>

      {/* CTA block — anthracite, inverse + secondary. `-mb-32` cancels the footer's mt-32 so block meets footer. */}
      <section className="on-block -mb-32 py-20 md:py-28">
        <div className="container-x grid grid-cols-4 items-end gap-x-6 gap-y-10 md:grid-cols-12">
          <div className="col-span-4 md:col-span-7">
            <Eyebrow>{t("ctaEyebrow")}</Eyebrow>
            <h2 className="mt-4 text-ink">{t("ctaTitle")}</h2>
            <p className="mt-4 max-w-[48ch] text-ink-muted">{t("ctaText")}</p>
          </div>
          <div className="col-span-4 flex flex-wrap gap-3 md:col-span-4 md:col-start-9 md:justify-end">
            <Cta variant="inverse" href="/nachhaltigkeit">{t("ctaSustainability")}</Cta>
            <Cta variant="secondary" href="/rezepte">{t("ctaRecipes")}</Cta>
          </div>
        </div>
      </section>
    </>
  );
}
