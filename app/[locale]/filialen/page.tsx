import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/brand/page-hero";
import { SectionHeading } from "@/components/brand/section-heading";
import { Cta } from "@/components/brand/cta";
import { StoreFinder, type FinderStore } from "@/components/signature/store-finder";
import { PfandKompass } from "@/components/signature/pfand-kompass";
import { ProductCard } from "@/components/commerce/product-card";
import { Reveal } from "@/components/motion/reveal";
import { tx } from "@/lib/l10n";
import { getRegionalProducts, getSettings, getStores } from "@/lib/content";
import { toCardProduct } from "@/lib/view-models";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "stores" });
  return { alternates: alternatesFor(locale, "/filialen"), title: t("title"), description: t("text") };
}

export function toFinderStore(s: ReturnType<typeof getStores>[number]): FinderStore {
  return {
    slug: s.slug, name: s.name, coords: s.coords, district: s.address.district, zip: s.address.zip, city: s.address.city,
    address: s.address.street ? `${s.address.street}, ${s.address.zip} ${s.address.city}` : `${s.address.zip} ${s.address.city}-${s.address.district}`,
    addressPending: s.address.status === "pending", hoursPending: s.hoursStatus === "pending", hours: s.hours, services: s.services, intro: s.intro,
  };
}

export default async function StoresPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("stores");
  const tc = await getTranslations("common");
  const settings = getSettings();
  const all = getStores();
  const stores = all.map(toFinderStore);
  const plate = all[0]?.images[0];
  const regional = getRegionalProducts().slice(0, 4).map((p) => toCardProduct(p, locale));

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} text={t("text")} image={plate?.src ?? "/images/placeholders/filiale-roedelheim-aussen.jpg"} imageAlt={plate ? tx(plate.alt, locale) : ""} />

      <section className="border-y border-line" aria-label={t("finderEyebrow")}>
        <StoreFinder stores={stores} />
      </section>

      <section className="container-x py-20 md:py-28">
        <SectionHeading eyebrow={t("pfandEyebrow")} title={t("pfandTitle")} text={t("pfandText")} />
        <Reveal className="mt-10"><PfandKompass types={settings.pfand.types} /></Reveal>
      </section>

      <section className="container-x pb-24">
        <SectionHeading regional eyebrow={t("regionalEyebrow")} title={t("regionalTitle")} aside={<Cta href="/kategorien/alle" variant="secondary" size="sm">{tc("showAll")}</Cta>} />
        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">{regional.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
      </section>
    </>
  );
}
