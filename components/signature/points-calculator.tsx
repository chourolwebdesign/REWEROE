"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { m } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { formatNumber, formatPrice } from "@/lib/format";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * REWE Bonus calculator (§4.30): monthly spend → bonus points per year → euro credit.
 * The result panel is the Bonus world: petrol field, pale-yellow numerals — the only place these two colours exist.
 * Display numerals are set proportional (not `num`): Schibsted's tabular figures space the separators („350 , 00 €“).
 */
export function PointsCalculator({ eurosPerPoint, centPerPoint }: { eurosPerPoint: number; centPerPoint: number }) {
  const t = useTranslations("bonus");
  const locale = useLocale();
  const [monthly, setMonthly] = useState(350);
  const points = Math.floor((monthly * 12) / eurosPerPoint);
  const value = (points * centPerPoint) / 100;
  return (
    <div className="grid gap-8 border border-line bg-card p-6 md:grid-cols-[1.2fr_1fr] md:p-8">
      <div>
        <label className="eyebrow block" htmlFor="spend">{t("calcLabel")}</label>
        <p className="display mt-3 text-[3rem] leading-none text-ink [font-variant-numeric:proportional-nums_lining-nums]">{formatPrice(monthly, locale)}</p>
        <Slider id="spend" className="mt-8" value={[monthly]} min={50} max={1500} step={10} onValueChange={(v) => setMonthly(v[0])} aria-label={t("calcLabel")} />
        <p className="num mt-2 text-[12px] text-ink-muted">{t("spendRange", { min: formatNumber(50, locale), max: formatNumber(1500, locale) })}</p>
        <p className="mt-6 text-[12px] leading-relaxed text-ink-muted">{t("calcNote", { euros: eurosPerPoint, cent: centPerPoint })}</p>
      </div>
      <div className="flex flex-col justify-between bg-petrol p-6 text-white">
        <div>
          <p className="eyebrow text-bonus-yellow/80">{t("calcPoints")}</p>
          <m.p key={points} initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.24, ease: EASE }} className="display mt-3 text-[3rem] leading-none text-bonus-yellow [font-variant-numeric:proportional-nums_lining-nums]">
            {formatNumber(points, locale)}
          </m.p>
        </div>
        <div className="mt-8">
          <p className="eyebrow text-bonus-yellow/80">{t("calcValue")}</p>
          <m.p key={value} initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.24, ease: EASE }} className="display mt-3 text-[2rem] leading-none text-bonus-yellow [font-variant-numeric:proportional-nums_lining-nums]">
            {formatPrice(value, locale)}
          </m.p>
          <p className="mt-2 text-sm text-white">{t("calcVouchers")}</p>
        </div>
      </div>
    </div>
  );
}
