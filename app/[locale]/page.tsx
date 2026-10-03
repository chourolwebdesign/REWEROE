import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Hero } from "@/components/home/hero";
import { Marquee } from "@/components/motion/marquee";
import { SectionHeading } from "@/components/brand/section-heading";
import { CategoryCard } from "@/components/cards/category-card";
import { RecipeCard } from "@/components/cards/recipe-card";
import { OffersCarousel } from "@/components/home/offers-carousel";
import { NewsletterForm } from "@/components/home/newsletter";
import { StoreSelector, WhenStoreChosen } from "@/components/signature/store-selector";
import { ProductCard } from "@/components/commerce/product-card";
import { Counter } from "@/components/motion/counter";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Cta } from "@/components/brand/cta";
import { SmartImage } from "@/components/ui/smart-image";
import { getBlur } from "@/lib/blur";
import { tx } from "@/lib/l10n";
import { toCardProduct } from "@/lib/view-models";
import { getActiveCampaigns, getCategories, getProduct, getRecipes, getRegionalProducts, getSettings, getStores } from "@/lib/content";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const settings = getSettings();
  const categories = getCategories();
  const offers = getActiveCampaigns().map((c) => getProduct(c.productSlug)).filter(Boolean).map((p) => toCardProduct(p!, locale));
  const recipes = getRecipes().slice(0, 3);
  const stores = getStores().map((s) => ({ slug: s.slug, name: s.name, district: s.address.district, city: s.address.city, zip: s.address.zip, intro: s.intro }));
  const regional = getRegionalProducts().slice(0, 4).map((p) => toCardProduct(p, locale));
  void getLocale;

  return (
    <>
      <Hero settings={settings} locale={locale} />
      <Marquee items={settings.marquee.map((m) => tx(m, locale))} className="bg-surface text-ink" />

      {/* Categories */}
      <section className="container-x py-24 md:py-32">
        <SectionHeading eyebrow={t("categoriesEyebrow")} title={t("categoriesTitle")} text={t("categoriesText")} />
        <Stagger className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((c, i) => (
            <StaggerItem key={c.slug}><CategoryCard c={c} locale={locale} index={i} /></StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Offers */}
      <section className="bg-surface-2/60 py-24  md:py-32">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow={t("offersEyebrow")} title={t("offersTitle")} text={t("offersText")} />
            <Cta href="/angebote" variant="secondary">{t("offersAll")}</Cta>
          </div>
          <div className="mt-12"><OffersCarousel items={offers} /></div>
        </div>
      </section>

      {/* Recipes */}
      <section className="container-x py-24 md:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow={t("recipesEyebrow")} title={t("recipesTitle")} text={t("recipesText")} />
          <Cta href="/rezepte" variant="secondary">{t("recipesAll")}</Cta>
        </div>
        <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
          {recipes.map((r) => (
            <StaggerItem key={r.slug}><RecipeCard r={r} locale={locale} /></StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Manifesto */}
      <section className="relative overflow-hidden bg-forest py-28 text-cream md:py-40">
        <div className="fresh-glow absolute inset-0 opacity-80" aria-hidden />
        <div className="container-x relative grid gap-16 lg:grid-cols-[1.3fr_1fr]">
          <Reveal>
            <p className="eyebrow mb-6">{t("manifestoEyebrow")}</p>
            <blockquote className="serif text-[clamp(2rem,4.2vw,4.25rem)] leading-[1.05] tracking-[-0.02em]">{t("manifestoQuote")}</blockquote>
            <p className="mono mt-8 text-[11px] uppercase tracking-[0.2em] text-cream/60">— {t("manifestoAuthor")}</p>
            <Cta href="/nachhaltigkeit" variant="inverse" className="mt-10">{t("manifestoCta")}</Cta>
          </Reveal>
          <Stagger className="grid grid-cols-2 gap-x-8 gap-y-10 self-end">
            {settings.stats.map((s) => (
              <StaggerItem key={s.id}>
                <p className="mono text-[clamp(2.5rem,5vw,4.5rem)] leading-none text-rewe"><Counter value={s.value} suffix={s.suffix} locale={locale} /></p>
                <p className="mt-2 text-sm text-cream/70">{tx(s.label, locale)}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Store teaser */}
      <section className="container-x grid items-center gap-12 py-24 md:py-32 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow={t("storeEyebrow")} title={t("storeTitle")} text={t("storeText")} />
          <Reveal delay={0.1} className="mt-10"><StoreSelector stores={stores} /></Reveal>
        </div>
        <Reveal className="relative aspect-[4/5] overflow-hidden rounded-[14px] bg-forest lg:aspect-[5/6]">
          <SmartImage src="/images/placeholders/filiale-roedelheim-aussen.jpg" alt="REWE Rödelheim" blur={getBlur("/images/placeholders/filiale-roedelheim-aussen.jpg")} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest/90 to-transparent p-8 text-cream">
            <p className="eyebrow mb-2">Frankfurt am Main</p>
            <p className="serif text-3xl">Rödelheim</p>
            <Link href="/filialen" className="mono mt-3 inline-block text-[11px] uppercase tracking-widest underline-offset-4 hover:underline">{t("ctaSecondary")} →</Link>
          </div>
        </Reveal>
      </section>

      {/* Personalised regional block — signature: appears only when "Meine Filiale" is chosen */}
      <WhenStoreChosen>
        <section className="container-x pb-24">
          <SectionHeading eyebrow="— Regional in Rödelheim" title={locale === "en" ? "From nearby, in your store." : "Aus der Nähe, in deinem Markt."} />
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {regional.map((p) => <ProductCard key={p.slug} p={p} />)}
          </div>
        </section>
      </WhenStoreChosen>

      {/* Newsletter */}
      <section className="relative overflow-hidden bg-forest text-cream">
        <div className="absolute inset-0 opacity-30">
          <SmartImage src="/images/placeholders/newsletter.jpg" alt="" blur={getBlur("/images/placeholders/newsletter.jpg")} fill sizes="100vw" className="object-cover" />
        </div>
        <div className="gold-glow absolute inset-x-0 top-0 h-40" aria-hidden />
        <div className="container-x relative grid gap-10 py-24 md:grid-cols-2 md:items-center md:py-32">
          <Reveal>
            <p className="eyebrow mb-4">{t("newsletterEyebrow")}</p>
            <h2 className="text-cream">{t("newsletterTitle")}</h2>
            <p className="mt-4 max-w-md text-cream/75">{t("newsletterText")}</p>
          </Reveal>
          <Reveal delay={0.1}><NewsletterForm /></Reveal>
        </div>
      </section>
    </>
  );
}
