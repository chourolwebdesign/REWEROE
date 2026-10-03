"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { m } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { formatNumber, formatPrice } from "@/lib/format";

/** Signature feature: monthly spend → yearly PAYBACK points → voucher value. */
export function PointsCalculator({ eurosPerPoint, centPerPoint }: { eurosPerPoint: number; centPerPoint: number }) {
  const t = useTranslations("bonus");
  const locale = useLocale();
  const [monthly, setMonthly] = useState(350);
  const points = Math.floor((monthly * 12) / eurosPerPoint);
  const value = (points * centPerPoint) / 100;
  return (
    <div className="grid gap-8 rounded-[16px] border border-gold/40 bg-card p-6 md:grid-cols-2 md:p-10">
      <div>
        <label className="eyebrow block" htmlFor="spend">{t("calcLabel")}</label>
        <p className="mono mt-3 text-5xl font-medium text-forest dark:text-cream">{formatPrice(monthly, locale)}</p>
        <Slider id="spend" className="mt-6" value={[monthly]} min={50} max={1500} step={10} onValueChange={(v) => setMonthly(v[0])} aria-label={t("calcLabel")} />
        <div className="mono mt-2 flex justify-between text-[11px] text-ink-muted"><span>50 €</span><span>1.500 €</span></div>
        <p className="mt-6 text-xs text-ink-muted">{t("calcNote", { euros: eurosPerPoint, cent: centPerPoint })}</p>
      </div>
      <div className="rounded-[12px] bg-forest p-6 text-cream">
        <p className="eyebrow">{t("calcPoints")}</p>
        <m.p key={points} initial={{ opacity: 0.5, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mono mt-2 text-5xl font-medium text-rewe">{formatNumber(points, locale)}</m.p>
        <p className="eyebrow mt-8">{t("calcValue")}</p>
        <m.p key={value} initial={{ opacity: 0.5, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mono mt-2 text-4xl font-medium">{formatPrice(value, locale)} <span className="text-base text-cream/60">{t("calcVouchers")}</span></m.p>
      </div>
    </div>
  );
}
