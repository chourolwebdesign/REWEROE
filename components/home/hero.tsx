import { getTranslations } from "next-intl/server";
import { SmartImage } from "@/components/ui/smart-image";
import { WordReveal } from "@/components/motion/word-reveal";
import { FreshnessClock } from "@/components/signature/freshness-clock";
import { Cta } from "@/components/brand/cta";
import { getBlur } from "@/lib/blur";
import { tx } from "@/lib/l10n";
import { formatDateShort, formatNumber } from "@/lib/format";
import { openState, toMinutes } from "@/lib/hours";
import { getActiveCampaigns, getRegionalProducers } from "@/lib/content";
import type { Settings, Store } from "@/lib/content/types";

const PLATE = "/images/placeholders/hero-home.jpg";
const pad2 = (n: number) => String(n).padStart(2, "0");

/** Pfand machines stop 15 min before the store closes: "21:45" from the current/next opening day, null while pending. */
function pfandUntil(store: Store): string | null {
  if (store.hoursStatus === "pending") return null;
  const s = openState(store.hours, store.hoursStatus);
  const close = s.kind === "open" ? s.closesAt : s.kind === "closed" ? store.hours[s.opensDay]?.[1] : undefined;
  if (!close) return null;
  const min = toMinutes(close) - 15;
  return `${pad2(Math.floor(min / 60))}:${pad2(min % 60)}`;
}

/**
 * Home hero (§4.5): light paper, no photo overlay, no gradient, no 100svh. Type column (Frische-Uhr · eyebrow ·
 * h1 WordReveal · lede · two CTAs) beside a 4:5 photograph in a hairline frame with a caption row, and a four-cell
 * data strip (assortment · offer validity · regional producers · Pfand return). The primary CTA is the viewport's one red.
 * The type column is top-aligned and the plate capped at `100svh − 8rem` so that CTA stays above the fold on 768–800 px laptops.
 */
export async function Hero({ settings, locale, store }: { settings: Settings; locale: string; store: Store }) {
  const t = await getTranslations("home");
  const tc = await getTranslations("common");

  const street = store.address.status === "published" && store.address.street ? store.address.street : t("addressPending");
  const latestValid = getActiveCampaigns().map((c) => c.validUntil).sort().at(-1);
  const producers = getRegionalProducers().length; // canonical count — same source as /regional and the Markenwelten tile
  const pfand = pfandUntil(store);

  const strip: { label: string; value: string }[] = [
    { label: t("strip.items"), value: formatNumber(settings.brand.assortmentSize, locale) },
    { label: t("strip.offers"), value: latestValid ? tc("until", { time: formatDateShort(latestValid, locale) }) : "—" },
    { label: t("strip.producers"), value: formatNumber(producers, locale) },
    { label: t("strip.pfand"), value: pfand ? tc("until", { time: pfand }) : t("pendingShort") },
  ];

  return (
    <section className="container-x pb-12 pt-10 md:pb-16 md:pt-14">
      <div className="grid grid-cols-4 gap-x-6 gap-y-10 md:grid-cols-12 lg:items-start">
        {/* Type column */}
        <div className="col-span-4 flex flex-col md:col-span-12 lg:col-span-6">
          <FreshnessClock slots={settings.freshnessClock} hours={store.hours} hoursStatus={store.hoursStatus} className="self-start" />
          <p className="eyebrow mt-8">{tx(settings.brand.tagline, locale)} · {street}</p>
          <h1 className="mt-5 max-w-[11ch] text-ink">
            <WordReveal text={tx(settings.brand.premiumClaim, locale)} />
          </h1>
          <p className="mt-6 max-w-[48ch] text-[clamp(1.125rem,1.03rem+0.38vw,1.375rem)] leading-[1.45] tracking-[-0.005em] text-ink-2">{t("subtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Cta href="/angebote" size="lg">{t("ctaOffers")}</Cta>
            <Cta href="/filialen" variant="secondary" size="lg" arrow={false}>{t("ctaStore")}</Cta>
          </div>
        </div>

        {/* Image plate */}
        <figure className="col-span-4 md:col-span-12 lg:col-span-6 lg:col-start-7">
          <div className="frame relative aspect-[4/3] overflow-hidden bg-surface lg:aspect-[4/5] lg:max-h-[calc(100svh-8rem)] lg:min-h-[70svh]">
            <SmartImage src={PLATE} alt={t("heroAlt")} blur={getBlur(PLATE)} fill preload sizes="(max-width:1024px) 100vw, 48vw" className="img-grade object-cover" />
          </div>
          <figcaption className="rule mt-3 flex items-baseline justify-between gap-4 pt-2">
            <span className="data text-ink-muted">{t("heroCaption")}</span>
            <span className="data hidden text-right text-ink-muted sm:inline lg:hidden xl:inline">{settings.brand.merchant} · {store.address.zip} {store.address.city}</span>
          </figcaption>
        </figure>

        {/* Data strip */}
        <dl className="col-span-4 mt-6 grid grid-cols-2 gap-px border-y border-line bg-line md:col-span-12 md:grid-cols-4 lg:mt-10">
          {strip.map((cell) => (
            <div key={cell.label} className="bg-paper px-4 py-4 max-md:odd:pl-0 md:first:pl-0">
              <dt className="eyebrow">{cell.label}</dt>
              <dd className="num mt-1 text-[20px] font-bold leading-none text-ink">{cell.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
