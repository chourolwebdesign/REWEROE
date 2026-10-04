import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/hero";
import { Marquee } from "@/components/motion/marquee";
import { SectionHeading } from "@/components/brand/section-heading";
import { Eyebrow } from "@/components/brand/eyebrow";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { CategoryCard } from "@/components/cards/category-card";
import { RecipeCard } from "@/components/cards/recipe-card";
import { OffersCarousel } from "@/components/home/offers-carousel";
import { NewsletterForm } from "@/components/home/newsletter";
import { StoreSelector, WhenStoreChosen } from "@/components/signature/store-selector";
import { StoreChip } from "@/components/signature/store-chip";
import { ProductCard } from "@/components/commerce/product-card";
import { Counter } from "@/components/motion/counter";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Cta } from "@/components/brand/cta";
import { SmartImage } from "@/components/ui/smart-image";
import { getBlur } from "@/lib/blur";
import { tx } from "@/lib/l10n";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import { toCardProduct } from "@/lib/view-models";
import {
  getActiveCampaigns, getCategories, getPrimaryStore, getProduct, getProducts, getRecipes, getRegionalProducers, getRegionalProducts, getSettings, getStores,
} from "@/lib/content";

const STORE_PLATE = "/images/placeholders/filiale-roedelheim-aussen.jpg";
const WORLD_IMAGES = { regional: "/images/placeholders/hero-regional.jpg", bio: "/images/placeholders/hero-bio.jpg" } as const;

type Proof = { label: string; value: string };

/** Markenwelten tile (§4.36): 16:9 photograph, sub-brand lockup, display title, proof-point `dl`, secondary CTA. */
function WorldTile({ sub, alt, eyebrow, title, text, proof, cta, href }: { sub: "regional" | "bio"; alt: string; eyebrow?: string; title: string; text: string; proof: Proof[]; cta: string; href: string }) {
  const src = WORLD_IMAGES[sub];
  return (
    <article className="frame flex w-full flex-col">
      <div className="relative aspect-[16/9] overflow-hidden border-b border-line bg-surface">
        <SmartImage src={src} alt={alt} blur={getBlur(src)} fill sizes="(max-width:768px) 100vw, 50vw" className="img-grade object-cover" />
      </div>
      <div className={cn("flex flex-1 flex-col p-6 md:p-8", sub === "bio" && "bg-bio-tint")}>
        <BrandLockup sub={sub} size="md" className="self-start" />
        {eyebrow && <Eyebrow regional className="mt-6">{eyebrow}</Eyebrow>}
        <h3 className={cn("display text-[clamp(1.75rem,2.6vw,2.5rem)] text-ink", eyebrow ? "mt-3" : "mt-6")}>{title}</h3>
        <p className="mt-3 max-w-[48ch] text-[15px] leading-relaxed text-ink-2">{text}</p>
        {/* Proof points: label-left / value-right rows on phones, three divided columns from sm (78 px cells broke words mid-syllable). */}
        <dl className="mt-6 grid grid-cols-1 divide-y divide-line border-y border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {proof.map((cell) => (
            <div key={cell.label} className="flex items-baseline justify-between gap-3 py-3 sm:flex-col-reverse sm:items-start sm:gap-1 sm:px-3 sm:first:pl-0">
              <dt className="eyebrow">{cell.label}</dt>
              <dd className="num text-right text-[16px] font-bold leading-tight text-ink sm:text-left lg:text-[18px]">{cell.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-auto pt-6">
          <Cta variant="secondary" href={href}>{cta}</Cta>
        </div>
      </div>
    </article>
  );
}

/** Offer prices and campaign windows are baked into the static page — regenerate hourly so expired campaigns drop out (§4.15). */
export const revalidate = 3600;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tw = await getTranslations("home.worlds");
  const settings = getSettings();
  const store = getPrimaryStore();
  const categories = getCategories();
  const offers = getActiveCampaigns().map((c) => getProduct(c.productSlug)).filter(Boolean).map((p) => toCardProduct(p!, locale));
  const recipes = getRecipes().slice(0, 3);
  const stores = getStores().map((s) => ({ slug: s.slug, name: s.name, district: s.address.district, city: s.address.city, zip: s.address.zip, intro: s.intro }));
  const regional = getRegionalProducts().slice(0, 4).map((p) => toCardProduct(p, locale));
  const regionalProducers = getRegionalProducers().length; // canonical count (triage contract) — never a literal
  const stats = settings.stats.map((s) => (s.id === "producers" ? { ...s, value: regionalProducers } : s));
  const bioItems = getProducts().filter((p) => p.badges.includes("bio")).length;

  return (
    <>
      <Hero settings={settings} locale={locale} store={store} />
      <Marquee items={settings.marquee.map((m) => tx(m, locale))} label={t("valuesLabel")} />

      <div className="numbered">
        {/* 01 Sortiment */}
        <section data-numbered className="container-x py-20 md:py-28">
          <SectionHeading auto eyebrow={t("categoriesEyebrow")} title={t("categoriesTitle")} text={t("categoriesText")} />
          <Stagger className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((c, i) => (
              <StaggerItem key={c.slug}><CategoryCard c={c} locale={locale} index={i} /></StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* 02 Markenwelten */}
        <section data-numbered className="container-x py-20 md:py-28">
          <SectionHeading auto eyebrow={tw("eyebrow")} title={tw("title")} text={tw("text")} />
          <Stagger className="mt-12 grid grid-cols-4 gap-x-6 gap-y-8 md:grid-cols-12">
            <StaggerItem className="col-span-4 flex md:col-span-6">
              <WorldTile
                sub="regional"
                alt={tw("regional.alt")}
                eyebrow={tw("regional.eyebrow")}
                title={tw("regional.title")}
                text={tw("regional.text")}
                proof={[
                  { label: tw("regional.producers"), value: formatNumber(regionalProducers, locale) },
                  { label: tw("regional.radius"), value: tw("regional.radiusValue") },
                  { label: tw("regional.window"), value: tw("regional.windowValue") },
                ]}
                cta={tw("regional.cta")}
                href="/regional"
              />
            </StaggerItem>
            <StaggerItem className="col-span-4 flex md:col-span-6">
              <WorldTile
                sub="bio"
                alt={tw("bio.alt")}
                title={tw("bio.title")}
                text={tw("bio.text")}
                proof={[
                  { label: tw("bio.seal"), value: tw("bio.sealValue") },
                  { label: tw("bio.gmo"), value: tw("bio.gmoValue") },
                  { label: tw("bio.items"), value: formatNumber(bioItems, locale) },
                ]}
                cta={tw("bio.cta")}
                href="/bio"
              />
            </StaggerItem>
          </Stagger>
        </section>

        {/* 03 Angebote */}
        <section data-numbered className="bg-surface py-20 md:py-28">
          <div className="container-x">
            <SectionHeading auto eyebrow={t("offersEyebrow")} title={t("offersTitle")} text={t("offersText")} aside={<Cta href="/angebote" variant="secondary">{t("offersAll")}</Cta>} />
            <div className="mt-12"><OffersCarousel items={offers} /></div>
          </div>
        </section>

        {/* 04 Rezepte */}
        <section data-numbered className="container-x py-20 md:py-28">
          <SectionHeading auto eyebrow={t("recipesEyebrow")} title={t("recipesTitle")} text={t("recipesText")} aside={<Cta href="/rezepte" variant="secondary">{t("recipesAll")}</Cta>} />
          <Stagger className="mt-12 grid gap-x-6 gap-y-12 md:grid-cols-3">
            {recipes.map((r) => (
              <StaggerItem key={r.slug} className="h-full"><RecipeCard r={r} locale={locale} /></StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* 05 Haltung — manifesto + 2×2 stats (§4.22) */}
        <section data-numbered className="on-block py-24 md:py-36">
          <div className="container-x grid grid-cols-4 gap-x-6 gap-y-12 md:grid-cols-12">
            <Reveal className="col-span-4 md:col-span-7">
              <Eyebrow auto>{t("manifestoEyebrow")}</Eyebrow>
              <blockquote className="display mt-6 text-[clamp(2rem,4.2vw,4.25rem)] leading-[1.02] text-block-ink">{t("manifestoQuote")}</blockquote>
              <p className="data-lg mt-8 text-block-muted">— {t("manifestoAuthor")}</p>
              <Cta href="/nachhaltigkeit" variant="inverse" className="mt-10">{t("manifestoCta")}</Cta>
            </Reveal>
            <Stagger className="col-span-4 grid grid-cols-2 gap-px self-end border border-block-line bg-block-line md:col-span-5 md:col-start-8 lg:col-span-4 lg:col-start-9">
              {stats.map((s) => (
                <StaggerItem key={s.id} className="bg-block p-6">
                  <p className="display whitespace-nowrap text-[clamp(2rem,0.9rem+2.5vw,4rem)] leading-none tracking-[-0.03em] text-block-ink tabular-nums lining-nums">
                    <Counter value={s.value} locale={locale} />
                    {s.suffix && <span className="text-[0.5em] text-block-red">{s.suffix}</span>}
                  </p>
                  <p className="mt-2 text-[13px] text-block-muted">{tx(s.label, locale)}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* 06 Mein Markt — store teaser (§4.20) */}
        <section data-numbered className="container-x py-20 md:py-28">
          <div className="grid grid-cols-4 gap-x-6 gap-y-12 md:grid-cols-12">
            <Reveal className="col-span-4 md:col-span-12 lg:col-span-5">
              <div className="rule pt-6">
                <Eyebrow auto>{t("storeEyebrow")}</Eyebrow>
                <h2 className="mt-4 text-ink">{t("storeTitle")}</h2>
                <p className="mt-5 max-w-[40ch] text-[15px] leading-relaxed text-ink-muted">{t("storeText")}</p>
              </div>
              <StoreSelector stores={stores} className="mt-10" />
            </Reveal>
            <Reveal delay={0.1} className="col-span-4 md:col-span-12 lg:col-span-6 lg:col-start-7">
              <div className="frame relative aspect-[4/5] overflow-hidden bg-surface">
                <SmartImage src={STORE_PLATE} alt={store.name} blur={getBlur(STORE_PLATE)} fill sizes="(max-width:1024px) 100vw, 48vw" className="img-grade object-cover" />
              </div>
              <div className="rule mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pt-3">
                <div>
                  <p className="eyebrow">{store.address.city}</p>
                  <p className="display mt-1 text-2xl text-ink">{store.address.district}</p>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                  <Cta variant="link" href="/filialen" size="sm">{t("storeLink")}</Cta>
                  <StoreChip hours={store.hours} hoursStatus={store.hoursStatus} size="sm" storeSlug={store.slug} />
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Personalised regional block — signature: appears only when „Meine Filiale" is chosen (not numbered) */}
        <WhenStoreChosen>
          <section className="container-x pb-20 md:pb-28">
            <SectionHeading regional eyebrow={t("regionalEyebrow")} title={t("regionalTitle")} />
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
              {regional.map((p) => <ProductCard key={p.slug} p={p} />)}
            </div>
          </section>
        </WhenStoreChosen>

        {/* 07 Newsletter — on paper (§4.21) */}
        <section data-numbered className="container-x py-20 md:py-28">
          <div className="rule-strong grid grid-cols-4 gap-x-6 gap-y-10 pt-6 md:grid-cols-12">
            <Reveal className="col-span-4 md:col-span-6">
              <Eyebrow auto>{t("newsletterEyebrow")}</Eyebrow>
              <h2 className="mt-4 text-ink">{t("newsletterTitle")}</h2>
              <p className="mt-5 max-w-[40ch] text-[15px] leading-relaxed text-ink-muted">{t("newsletterText")}</p>
            </Reveal>
            <Reveal delay={0.1} className="col-span-4 self-end md:col-span-6 lg:col-span-5 lg:col-start-8">
              <NewsletterForm />
            </Reveal>
          </div>
        </section>
      </div>
    </>
  );
}
