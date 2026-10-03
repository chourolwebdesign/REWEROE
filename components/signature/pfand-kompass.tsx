"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { QuantityStepper } from "@/components/commerce/quantity-stepper";
import { formatPrice } from "@/lib/format";
import { tx, type L10n } from "@/lib/l10n";

export interface PfandType { id: string; label: L10n; amount: number }

/** Signature feature: count your empties, see what the machine pays out. */
export function PfandKompass({ types }: { types: PfandType[] }) {
  const t = useTranslations("stores");
  const locale = useLocale();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const total = types.reduce((n, ty) => n + (counts[ty.id] ?? 0) * ty.amount, 0);
  const lines = types.filter((ty) => (counts[ty.id] ?? 0) > 0);

  return (
    <div className="grid gap-8 rounded-[16px] border border-gold/40 bg-card p-6 md:grid-cols-[1.2fr_1fr] md:p-8">
      <ul className="divide-y divide-line">
        {types.map((ty) => (
          <li key={ty.id} className="flex items-center justify-between gap-4 py-3">
            <div>
              <p className="text-sm font-medium">{tx(ty.label, locale)}</p>
              <p className="mono text-[11px] text-ink-muted">{formatPrice(ty.amount, locale)}</p>
            </div>
            <QuantityStepper size="sm" value={counts[ty.id] ?? 0} onChange={(n) => setCounts({ ...counts, [ty.id]: n })} />
          </li>
        ))}
      </ul>
      <div className="flex flex-col justify-between rounded-[12px] bg-forest p-6 text-cream">
        <div>
          <p className="eyebrow">{t("pfandTotal")}</p>
          <motion.p key={total} initial={{ scale: 0.96, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }} className="mono mt-2 text-5xl font-medium text-rewe">{formatPrice(total, locale)}</motion.p>
          <ul className="mono mt-4 space-y-1 text-[11px] uppercase tracking-wider text-cream/70">
            {lines.length === 0 ? <li>0 × …</li> : lines.map((ty) => <li key={ty.id}>{counts[ty.id]} × {formatPrice(ty.amount, locale)} = {formatPrice(counts[ty.id] * ty.amount, locale)}</li>)}
          </ul>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <p className="text-[11px] text-cream/50">{t("pfandHint")}</p>
          <button type="button" onClick={() => setCounts({})} className="mono text-[11px] uppercase tracking-widest underline-offset-4 hover:underline">{t("pfandReset")}</button>
        </div>
      </div>
    </div>
  );
}
