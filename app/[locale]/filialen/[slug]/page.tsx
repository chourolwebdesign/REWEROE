import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MapPin, Phone, Mail, Navigation } from "lucide-react";
import { PageHero } from "@/components/brand/page-hero";
import { Breadcrumbs } from "@/components/brand/breadcrumbs";
import { SectionHeading } from "@/components/brand/section-heading";
import { StoreSelector } from "@/components/signature/store-selector";
import { ProductCard } from "@/components/commerce/product-card";
import { SmartImage } from "@/components/ui/smart-image";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Cta } from "@/components/brand/cta";
import { getBlur } from "@/lib/blur";
import { tx } from "@/lib/l10n";
import { toCardProduct } from "@/lib/view-models";
import { getRegionalProducts, getStore, getStores, type Weekday } from "@/lib/content";

export function generateStaticParams() { return getStores().map((s) => ({ slug: s.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const s = getStore(slug);
  return s ? { alternates: alternatesFor(locale, `/filialen/${slug}`), title: s.name, description: tx(s.intro, locale) } : {};
}

const days: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export default async function StorePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const s = getStore(slug);
  if (!s) notFound();
  const t = await getTranslations("stores");
  const tn = await getTranslations("nav");
  const tc = await getTranslations("common");
  const regional = getRegionalProducts().slice(0, 4).map((p) => toCardProduct(p, locale));
  const route = `https://www.google.com/maps/dir/?api=1&destination=${s.coords[0]},${s.coords[1]}`;
  const lite = [{ slug: s.slug, name: s.name, district: s.address.district, city: s.address.city, zip: s.address.zip, intro: s.intro }];

  return (
    <>
      <PageHero eyebrow={`${s.merchant} · ${s.storeNumber}`} title={s.name} text={tx(s.intro, locale)} image={s.images[0].src} imageAlt={tx(s.images[0].alt, locale)}>
        <Breadcrumbs inverse className="mt-8" items={[{ label: tn("home"), href: "/" }, { label: tn("stores"), href: "/filialen" }, { label: s.name }]} />
      </PageHero>

      <section className="container-x grid gap-10 py-16 lg:grid-cols-3">
        <Reveal className="rounded-[14px] border border-line bg-card p-6">
          <p className="eyebrow mb-4">{t("contact")}</p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rewe" /><span>{s.address.street || t("addressPending")}<br />{s.address.zip} {s.address.city}-{s.address.district}</span></li>
            <li className="flex items-center gap-3"><Phone className="h-4 w-4 shrink-0 text-rewe" /><span>{s.phone || t("phonePending")}</span></li>
            <li className="flex items-center gap-3"><Mail className="h-4 w-4 shrink-0 text-rewe" /><span>{s.email || "—"}</span></li>
          </ul>
          <a href={route} target="_blank" rel="noopener noreferrer" className="group mt-6 inline-flex items-center gap-2 rounded-[10px] bg-forest px-4 py-3 text-sm font-medium text-cream transition-colors hover:bg-emerald"><Navigation className="h-4 w-4 transition-transform group-hover:translate-x-1" /> {t("route")}</a>
          {s.coordsNote && <p className="mono mt-3 text-[10px] uppercase tracking-wider text-ink-muted">{s.coordsNote}</p>}
        </Reveal>
        <Reveal delay={0.05} className="rounded-[14px] border border-line bg-card p-6">
          <p className="eyebrow mb-4">{t("hours")}</p>
          <table className="mono w-full text-sm"><tbody>
            {days.map((d) => (
              <tr key={d} className="border-b border-line/60 last:border-0"><th scope="row" className="py-2 text-left font-normal text-ink-muted">{tc(`weekdays.${d}`)}</th><td className="py-2 text-right">{s.hours[d] ? `${s.hours[d]![0]} – ${s.hours[d]![1]}` : tc("closed")}</td></tr>
            ))}
          </tbody></table>
          {s.hoursStatus === "pending" && <p className="mono mt-3 text-[10px] uppercase tracking-wider text-gold">{t("hoursPending")}</p>}
        </Reveal>
        <Reveal delay={0.1} className="space-y-4">
          <div className="rounded-[14px] border border-line bg-card p-6">
            <p className="eyebrow mb-4">{t("services")}</p>
            <ul className="flex flex-wrap gap-1.5">{s.services.map((sv) => <li key={sv} className="mono rounded-[3px] bg-forest px-2 py-1 text-[10px] uppercase tracking-wider text-cream">{tc(`services.${sv}`)}</li>)}</ul>
          </div>
          <StoreSelector stores={lite} compact />
        </Reveal>
      </section>

      <section className="container-x pb-16">
        <p className="eyebrow mb-6">{t("gallery")}</p>
        <Stagger className="grid gap-4 md:grid-cols-3">
          {s.images.map((img, i) => (
            <StaggerItem key={i} className="relative aspect-[16/10] overflow-hidden rounded-[12px]"><SmartImage src={img.src} alt={tx(img.alt, locale)} blur={getBlur(img.src)} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" /></StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="container-x pb-24">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading eyebrow={t("regionalEyebrow")} title={t("regionalTitle")} />
          <Cta href="/kategorien/alle" variant="secondary" size="sm">{tc("showAll")}</Cta>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">{regional.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
      </section>
    </>
  );
}
