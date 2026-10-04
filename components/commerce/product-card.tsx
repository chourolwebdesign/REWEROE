"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Heart, Eye } from "lucide-react";
import { m } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { usePrefs } from "@/lib/store/prefs";
import { useMounted } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { formatDateShort } from "@/lib/format";
import { SmartImage } from "@/components/ui/smart-image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badges } from "./badges";
import { PriceTag } from "./price-tag";
import { PfandChip } from "./pfand-chip";
import { Rating } from "./rating";
import { AddToCart } from "./add-to-cart";
import { Countdown, elapsedShare, msLeft } from "@/components/motion/countdown";
import { toCartItem, type CardProduct } from "@/lib/view-models";

/** Below this many ms left the countdown row appears on its own (§4.15). */
const COUNTDOWN_AUTO_MS = 48 * 60 * 60 * 1000;

interface Props {
  p: CardProduct;
  className?: string;
  /** Force the countdown row (offers carousel, brochure). Otherwise it appears automatically under 48 h. */
  showCountdown?: boolean;
  priority?: boolean;
}

/**
 * Commerce centrepiece (§4.14 / §4.15): hairline card, 4:5 photograph, permanent ink add-to-cart, hover-revealed
 * quick view, legally complete price cell (price · Grundpreis · Pfand · validity · countdown-as-data · progress bar).
 */
export function ProductCard({ p, className, showCountdown, priority }: Props) {
  const t = useTranslations("category");
  const tp = useTranslations("product");
  const to = useTranslations("offers");
  const locale = useLocale();
  const favorites = usePrefs((s) => s.favorites);
  const toggle = usePrefs((s) => s.toggleFavorite);
  const fav = favorites.includes(p.slug);
  const [quick, setQuick] = useState(false);
  const mounted = useMounted();

  const isOffer = p.oldPrice != null && p.oldPrice > p.price;
  const countdownOn = Boolean(p.validUntil) && (Boolean(showCountdown) || (mounted && msLeft(p.validUntil!) < COUNTDOWN_AUTO_MS));
  const share = mounted && p.validFrom && p.validUntil ? elapsedShare(p.validFrom, p.validUntil) : 0;
  const barOn = Boolean(p.validFrom && p.validUntil);

  return (
    <article className={cn("group card-hover relative flex flex-col border border-line bg-card p-4", className)}>
      <div className="relative aspect-[4/5] overflow-hidden bg-surface">
        <Link href={`/produkt/${p.slug}`} className="absolute inset-0 block" aria-label={p.name}>
          <SmartImage src={p.image.src} alt={p.image.alt} blur={p.image.blur} fill sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 320px" className="img-zoom img-grade object-cover" preload={priority} />
        </Link>
        <Badges badges={p.badges} discount={p.discount} className="pointer-events-none absolute left-3 top-3 max-w-[calc(100%-4rem)]" />

        {/* Favourite: 44 px hit area, 36 px visual */}
        <button
          type="button"
          onClick={() => toggle(p.slug)}
          aria-pressed={fav}
          aria-label={fav ? tp("unfavorite") : tp("favorite")}
          className="absolute right-2 top-2 inline-flex h-11 w-11 items-center justify-center"
        >
          <span className="on-paper inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-paper/92 backdrop-blur-[2px] transition-colors duration-[var(--dur-ui)] group-hover:border-line-strong">
            <m.span animate={fav ? { scale: [1, 1.25, 1] } : { scale: 1 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], times: [0, 0.5, 1] }} className="inline-flex">
              <Heart className={cn("h-4 w-4 text-ink", fav && "fill-red-text text-red-text")} />
            </m.span>
          </span>
        </button>

        {/* Quick view (hover/focus-revealed on md+) + permanent add-to-cart */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuick(true)}
            aria-label={t("quickView")}
            className="on-paper inline-flex h-11 w-11 items-center justify-center rounded-[2px] border border-line bg-paper/92 text-ink backdrop-blur-[2px] transition-[opacity,transform,border-color] duration-[var(--dur-move)] ease-[var(--ease-ui)] hover:border-line-strong md:translate-x-2 md:opacity-0 md:group-focus-within:translate-x-0 md:group-focus-within:opacity-100 md:group-hover:translate-x-0 md:group-hover:opacity-100"
          >
            <Eye className="h-[18px] w-[18px]" aria-hidden />
          </button>
          <AddToCart item={toCartItem(p)} variant="icon" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 pt-4">
        <Link href={`/produkt/${p.slug}`} className="line-clamp-2 text-[15px] font-medium leading-snug text-ink underline-offset-4 hover:underline">{p.name}</Link>
        <p className="text-[12px] font-medium text-ink-muted">{p.subtitle}</p>

        <div className="rule mt-auto flex items-end justify-between gap-2 pt-3">
          <PriceTag price={p.price} oldPrice={p.oldPrice} basePrice={p.basePrice} size="md" />
          {p.pfand > 0 && <PfandChip amount={p.pfand} />}
        </div>

        {isOffer && p.validUntil && <p className="price-meta mt-2">{to("valid", { date: formatDateShort(p.validUntil, locale) })}</p>}

        {(countdownOn || barOn) && p.validUntil && (
          <div className="rule mt-3 pt-2">
            {countdownOn && (
              <div className="flex items-center justify-between gap-3">
                <span className="eyebrow">{to("ends")}</span>
                <Countdown until={p.validUntil} compact className="data-lg text-red-text" />
              </div>
            )}
            {barOn && (
              <div className={cn("h-[3px] w-full border-r border-line-strong bg-surface-2", countdownOn && "mt-2")} aria-hidden>
                <div className="h-full bg-red transition-[width] duration-[600ms] ease-[var(--ease-out-expo)]" style={{ width: `${Math.round(share * 1000) / 10}%` }} />
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={quick} onOpenChange={setQuick}>
        <DialogContent className="grid gap-0 overflow-hidden rounded-none border border-line-strong bg-card p-0 text-base text-ink shadow-pop ring-0 sm:max-w-2xl md:grid-cols-2">
          <div className="relative aspect-[4/5] bg-surface md:aspect-auto">
            <SmartImage src={p.image.src} alt={p.image.alt} blur={p.image.blur} fill sizes="400px" className="img-grade object-cover" />
          </div>
          <div className="flex flex-col gap-4 p-6">
            <Badges badges={p.badges} discount={p.discount} />
            <DialogTitle className="display text-2xl text-ink">{p.name}</DialogTitle>
            <p className="text-sm text-ink-muted">{p.subtitle}{p.producerName ? ` · ${p.producerName}` : ""}</p>
            <Rating value={p.rating} count={p.reviews} />
            <PriceTag price={p.price} oldPrice={p.oldPrice} basePrice={p.basePrice} pfand={p.pfand || undefined} size="lg" />
            <AddToCart item={toCartItem(p)} />
            <Link href={`/produkt/${p.slug}`} className="text-center text-[13px] font-semibold text-ink underline-offset-4 hover:underline">{t("toProduct")} →</Link>
          </div>
        </DialogContent>
      </Dialog>
    </article>
  );
}
