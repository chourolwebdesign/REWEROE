import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MapPin, Phone, Mail, Navigation } from "lucide-react";
import { PageHero } from "@/components/brand/page-hero";
import { Eyebrow } from "@/components/brand/eyebrow";
import { SectionHeading } from "@/components/brand/section-heading";
import { Cta } from "@/components/brand/cta";
import { StoreChip } from "@/components/signature/store-chip";
import { FreshnessClock } from "@/components/signature/freshness-clock";
import { MyStoreButton, StoreHours, StoreMapLazy } from "@/components/signature/store-finder";
import { ProductCard } from "@/components/commerce/product-card";
import { SmartImage } from "@/components/ui/smart-image";
import { JsonLd } from "@/components/seo/json-ld";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { getBlur } from "@/lib/blur";
import { tx } from "@/lib/l10n";
import { cn } from "@/lib/utils";
import { toCardProduct } from "@/lib/view-models";
import { getRegionalProducts, getSettings, getStore, getStores, type Img, type Weekday } from "@/lib/content";

export function generateStaticParams() { return getStores().map((s) => ({ slug: s.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const s = getStore(slug);
  return s ? { alternates: alternatesFor(locale, `/filialen/${slug}`), title: s.name, description: tx(s.intro, locale) } : {};
}

const RATIO: Record<NonNullable<Img["ratio"]>, string> = { "4:5": "aspect-[4/5]", "16:9": "aspect-video", "1:1": "aspect-square", "3:2": "aspect-[3/2]" };
const SCHEMA_DAY: Record<Weekday, string> = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };
/** Secondary button for plain anchors (external map deep links need `target`/`rel`, which `Cta` does not take). */
const btnSecondary = "inline-flex h-11 items-center justify-center gap-2 rounded-[2px] border border-line-strong px-4 text-sm font-semibold text-ink transition-colors duration-[var(--dur-ui)] hover:bg-ink hover:text-paper";

/** Filiale detail (§4.40): paper head row, live chips, facts grid, greyscale map, framed gallery with the real store clip, regional range. */
export default async function StorePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const s = getStore(slug);
  if (!s) notFound();
  const t = await getTranslations("stores");
  const tn = await getTranslations("nav");
  const tc = await getTranslations("common");
  const settings = getSettings();
  const regional = getRegionalProducts().slice(0, 4).map((p) => toCardProduct(p, locale));
  const [lat, lng] = s.coords;
  const route = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const geo = `geo:${lat},${lng}`;
  const locality = `${s.address.zip} ${s.address.city}-${s.address.district}`;
  const address = s.address.status === "published" && s.address.street ? `${s.address.street}, ${locality}` : null;
  const pickup = s.services.includes("click-collect");
  const delivery = s.services.includes("lieferservice");
  const plate = s.images[0];
  /** The plate is images[0]; the gallery shows the rest (wide first, then two small) beside the vertical clip. */
  const gallery = s.images.slice(1);
  const mapStores = [{ slug: s.slug, name: s.name, coords: s.coords, address: address ?? locality }];
  const ld = {
    "@context": "https://schema.org", "@type": "GroceryStore", name: s.name, url: `${settings.brand.siteUrl}/filialen/${s.slug}`,
    address: { "@type": "PostalAddress", ...(address ? { streetAddress: s.address.street } : {}), postalCode: s.address.zip, addressLocality: s.address.city, addressRegion: "Hessen", addressCountry: "DE" },
    geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng },
    ...(s.phone ? { telephone: s.phone } : {}),
    ...(s.hoursStatus === "published" ? { openingHoursSpecification: (Object.keys(s.hours) as Weekday[]).filter((d) => s.hours[d]).map((d) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: SCHEMA_DAY[d], opens: s.hours[d]![0], closes: s.hours[d]![1] })) } : {}),
  };

  return (
    <>
      <JsonLd data={ld} />
      <PageHero
        eyebrow={`${s.merchant} · ${s.storeNumber}`} title={s.name} text={tx(s.intro, locale)} className="pb-0 md:pb-0"
        breadcrumbs={[{ label: tn("home"), href: "/" }, { label: tn("stores"), href: "/filialen" }, { label: s.name }]}
      >
        <div className="flex flex-wrap items-center gap-3">
          <StoreChip hours={s.hours} hoursStatus={s.hoursStatus} storeSlug={s.slug} />
          <FreshnessClock slots={settings.freshnessClock} hours={s.hours} hoursStatus={s.hoursStatus} />
        </div>
      </PageHero>

      {/* 21:9 plate — a framed photograph under the head row, never a backdrop */}
      <figure className="container-x mt-10">
        <div className="frame relative aspect-[4/3] overflow-hidden bg-surface md:aspect-[21/9]">
          <SmartImage src={plate.src} alt={tx(plate.alt, locale)} blur={getBlur(plate.src)} fill priority sizes="100vw" className="img-grade object-cover" />
        </div>
        <figcaption className="data mt-2 text-ink-muted">{tx(plate.alt, locale)}</figcaption>
      </figure>

      {/* Facts grid */}
      <section className="container-x grid grid-cols-4 gap-x-6 gap-y-10 py-16 md:grid-cols-12">
        <Reveal className="col-span-4 border border-line bg-card p-6">
          <Eyebrow>{t("contactRoute")}</Eyebrow>
          <dl className="mt-4 divide-y divide-line text-sm">
            <div className="flex items-start gap-3 py-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
              <dt className="sr-only">{t("address")}</dt>
              <dd className="text-ink">{address ?? <>{t("addressPending")}<br /><span className="text-ink-muted">{locality}</span></>}</dd>
            </div>
            <div className="flex items-center gap-3 py-3">
              <Phone className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
              <dt className="sr-only">{t("phone")}</dt>
              <dd>{s.phone ? <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="text-ink underline-offset-4 hover:underline">{s.phone}</a> : <span className="text-ink-muted">{t("phonePending")}</span>}</dd>
            </div>
            <div className="flex items-center gap-3 py-3">
              <Mail className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
              <dt className="sr-only">{t("email")}</dt>
              <dd>{s.email ? <a href={`mailto:${s.email}`} className="text-ink underline-offset-4 hover:underline">{s.email}</a> : <span className="text-ink-muted">{t("emailPending")}</span>}</dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={route} target="_blank" rel="noopener noreferrer" className={btnSecondary}><Navigation className="h-4 w-4" aria-hidden />{t("route")}</a>
            <a href={geo} className={cn(btnSecondary, "md:hidden")}>{t("routeApp")}</a>
          </div>
          {s.coordsNote && <p className="mt-3 text-[12px] text-ink-muted">{s.coordsNote}</p>}
          <div className="rule mt-5 pt-5"><MyStoreButton slug={s.slug} /></div>
        </Reveal>

        <Reveal delay={0.05} className="col-span-4 border border-line bg-card p-6">
          <Eyebrow>{t("hours")}</Eyebrow>
          <StoreHours hours={s.hours} hoursStatus={s.hoursStatus} className="mt-4" />
        </Reveal>

        <Reveal delay={0.1} className="col-span-4">
          <Eyebrow>{t("services")}</Eyebrow>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {s.services.map((sv) => <li key={sv} className="data rounded-[2px] border border-line px-2 py-1.5 text-ink-muted">{tc(`services.${sv}`)}</li>)}
          </ul>
          <dl className="mt-6 text-sm">
            {[{ label: t("pickupService"), on: pickup }, { label: t("deliveryService"), on: delivery }].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 border-t border-line py-2.5">
                <dt className="text-ink">{row.label}</dt>
                <dd className={row.on ? "font-medium text-bio-text" : "text-ink-muted"}>{row.on ? t("available") : t("unavailable")}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      {/* Map */}
      <section className="container-x pb-16">
        <div className="rule-strong pt-6">
          <Eyebrow>{t("mapEyebrow")}</Eyebrow>
          <div className="mt-6 grid gap-6 lg:grid-cols-12">
            <div className="frame h-[420px] overflow-hidden bg-surface lg:col-span-8"><StoreMapLazy stores={mapStores} active={s.slug} /></div>
            <aside className="flex flex-col justify-between border border-line bg-card p-6 lg:col-span-4">
              <div>
                <p className="display text-2xl text-ink">{s.name}</p>
                <p className="mt-2 text-sm text-ink-muted">{address ?? `${t("addressPending")} · ${locality}`}</p>
                <div className="mt-4"><StoreChip hours={s.hours} hoursStatus={s.hoursStatus} size="sm" storeSlug={s.slug} /></div>
              </div>
              <a href={route} target="_blank" rel="noopener noreferrer" className={cn(btnSecondary, "mt-6 self-start")}><Navigation className="h-4 w-4" aria-hidden />{t("route")}</a>
            </aside>
          </div>
        </div>
      </section>

      {/* Gallery: real photographs in hairline frames + the vertical store clip (no autoplay, no text on photos) */}
      <section className="container-x pb-16">
        <div className="rule pt-6"><Eyebrow>{t("gallery")}</Eyebrow></div>
        <Stagger className="mt-6 grid items-start gap-6 md:grid-cols-12">
          {s.video && (
            <StaggerItem className="md:col-span-4 md:row-span-2">
              <figure className="mx-auto max-w-[420px] md:mx-0">
                <div className="frame relative aspect-[9/16] overflow-hidden bg-surface">
                  <video controls playsInline preload="none" poster={s.video.poster} className="img-grade h-full w-full object-cover" aria-label={tx(s.video.caption, locale) || t("videoEyebrow")}>
                    <source src={s.video.src} type="video/mp4" />
                  </video>
                </div>
                <figcaption className="data mt-2 text-ink-muted">{t("videoEyebrow")}{s.video.caption ? ` · ${tx(s.video.caption, locale)}` : ""}</figcaption>
              </figure>
            </StaggerItem>
          )}
          {gallery.map((img, i) => (
            <StaggerItem key={img.src} className={i === 0 ? "md:col-span-8" : "md:col-span-4"}>
              <figure>
                <div className={cn("frame relative overflow-hidden bg-surface", RATIO[img.ratio ?? "16:9"])}>
                  <SmartImage src={img.src} alt={tx(img.alt, locale)} blur={getBlur(img.src)} fill sizes={i === 0 ? "(max-width:768px) 100vw, 66vw" : "(max-width:768px) 100vw, 33vw"} className="img-grade object-cover" />
                </div>
                <figcaption className="data mt-2 text-ink-muted">{tx(img.alt, locale)}</figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Regional range in this store */}
      <section className="container-x pb-24">
        <SectionHeading regional eyebrow={t("regionalEyebrow")} title={t("regionalTitle")} aside={<Cta href="/kategorien/alle" variant="secondary" size="sm">{tc("showAll")}</Cta>} />
        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">{regional.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
      </section>
    </>
  );
}
