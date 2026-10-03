"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { tx, type L10n } from "@/lib/l10n";
import { cn } from "@/lib/utils";

type Slot = { from: number; to: number; message: L10n };

function berlinHour() {
  return Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Europe/Berlin" }).format(new Date()));
}
export function pickSlot(slots: Slot[], h: number) {
  return slots.find((s) => (s.from < s.to ? h >= s.from && h < s.to : h >= s.from || h < s.to)) ?? slots[0];
}

/** Signature detail: the hero line changes with the time of day in Rödelheim. Driven by settings.freshnessClock. */
export function FreshnessClock({ slots, className, inverse }: { slots: Slot[]; className?: string; inverse?: boolean }) {
  const locale = useLocale();
  const t = useTranslations("freshness");
  const [slot, setSlot] = useState<Slot | null>(null);
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      setSlot(pickSlot(slots, berlinHour()));
      setTime(new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }).format(new Date()));
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [slots]);

  return (
    <div className={cn("mono inline-flex items-center gap-3 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.16em]", inverse ? "border-cream/25 bg-cream/5 text-cream/90" : "border-line bg-card text-forest", className)} aria-live="polite">
      <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rewe opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-rewe" /></span>
      <span className="opacity-70">{t("label")}{time && ` · ${time}`}</span>
      {slot && (
        <motion.span key={tx(slot.message, locale)} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="normal-case tracking-normal">
          {tx(slot.message, locale)}
        </motion.span>
      )}
    </div>
  );
}
