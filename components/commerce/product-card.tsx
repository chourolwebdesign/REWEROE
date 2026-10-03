"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Heart, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { usePrefs } from "@/lib/store/prefs";
import { cn } from "@/lib/utils";
import { SmartImage } from "@/components/ui/smart-image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badges } from "./badges";
import { PriceTag } from "./price-tag";
import { PfandChip } from "./pfand-chip";
import { Rating } from "./rating";
import { AddToCart } from "./add-to-cart";
import { Countdown } from "@/components/motion/countdown";
import { toCartItem, type CardProduct } from "@/lib/view-models";

export function ProductCard({ p, className, showCountdown, priority }: { p: CardProduct; className?: string; showCountdown?: boolean; priority?: boolean }) {
  const t = useTranslations("category");
  const tp = useTranslations("product");
  const to = useTranslations("offers");
  const favorites = usePrefs((s) => s.favorites);
  const toggle = usePrefs((s) => s.toggleFavorite);
  const fav = favorites.includes(p.slug);
  const [quick, setQuick] = useState(false);

  return (
    <article className={cn("group relative flex flex-col overflow-hidden rounded-[12px] bg-card card-hover", className)}>
      <Link href={`/produkt/${p.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-surface-2" aria-label={p.name}>
        <SmartImage src={p.image.src} alt={p.image.alt} blur={p.image.blur} fill sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 320px" className="img-zoom object-cover" priority={priority} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest/40 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        <Badges badges={p.badges} discount={p.discount} className="absolute left-3 top-3" />
      </Link>

      <button
        type="button"
        onClick={() => toggle(p.slug)}
        aria-pressed={fav}
        aria-label={fav ? tp("unfavorite") : tp("favorite")}
        className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 text-forest backdrop-blur transition-colors hover:bg-white"
      >
        <motion.span animate={fav ? { scale: [1, 1.35, 1] } : { scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 16 }} className="inline-flex">
          <Heart className={cn("h-4 w-4", fav && "fill-price text-price")} />
        </motion.span>
      </button>

      <div className="absolute right-3 top-[calc(80%-3.25rem)] flex flex-col gap-2 md:translate-x-3 md:opacity-0 md:transition-all md:duration-500 md:ease-[cubic-bezier(.22,1,.36,1)] md:group-hover:translate-x-0 md:group-hover:opacity-100 md:group-focus-within:translate-x-0 md:group-focus-within:opacity-100">
        <AddToCart item={toCartItem(p)} variant="icon" />
        <button type="button" onClick={() => setQuick(true)} aria-label={t("quickView")} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cream/90 text-forest shadow-card backdrop-blur hover:bg-white"><Eye className="h-4 w-4" /></button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <Link href={`/produkt/${p.slug}`} className="font-medium leading-snug text-forest hover:underline dark:text-cream">{p.name}</Link>
          <p className="mono text-[11px] uppercase tracking-wider text-ink-muted">{p.subtitle}</p>
        </div>
        <Rating value={p.rating} count={p.reviews} />
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <PriceTag price={p.price} oldPrice={p.oldPrice} basePrice={p.basePrice} size="sm" />
          {p.pfand > 0 && <PfandChip amount={p.pfand} />}
        </div>
        {showCountdown && p.validUntil && (
          <div className="mono flex items-center justify-between border-t border-line pt-2 text-[11px] uppercase tracking-wider text-ink-muted">
            <span>{to("ends")}</span>
            <Countdown until={p.validUntil} compact className="text-price" />
          </div>
        )}
      </div>

      <Dialog open={quick} onOpenChange={setQuick}>
        <DialogContent className="grid gap-0 overflow-hidden p-0 sm:max-w-2xl md:grid-cols-2">
          <div className="relative aspect-[4/5] bg-surface-2 md:aspect-auto">
            <SmartImage src={p.image.src} alt={p.image.alt} blur={p.image.blur} fill sizes="400px" className="object-cover" />
          </div>
          <div className="flex flex-col gap-4 p-6">
            <Badges badges={p.badges} discount={p.discount} />
            <DialogTitle className="serif text-2xl font-medium leading-tight">{p.name}</DialogTitle>
            <p className="text-sm text-ink-muted">{p.subtitle}{p.producerName ? ` · ${p.producerName}` : ""}</p>
            <Rating value={p.rating} count={p.reviews} />
            <PriceTag price={p.price} oldPrice={p.oldPrice} basePrice={p.basePrice} pfand={p.pfand || undefined} size="lg" />
            <AddToCart item={toCartItem(p)} />
            <Link href={`/produkt/${p.slug}`} className="mono text-center text-[11px] uppercase tracking-widest underline-offset-4 hover:underline">{t("toProduct")} →</Link>
          </div>
        </DialogContent>
      </Dialog>
    </article>
  );
}
