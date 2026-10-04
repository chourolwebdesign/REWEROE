"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { m } from "framer-motion";
import { QuantityStepper } from "@/components/commerce/quantity-stepper";
import { Cta } from "@/components/brand/cta";
import { formatPrice } from "@/lib/format";
import { tx, type L10n } from "@/lib/l10n";

export interface PfandType { id: string; label: L10n; amount: number }

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Signature feature (§4.30): count your empties, see what the machine pays out. The total is the one justified green (Mehrweg). */
export function PfandKompass({ types }: { types: PfandType[] }) {
  const t = useTranslations("stores");
  const locale = useLocale();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const total = types.reduce((n, ty) => n + (counts[ty.id] ?? 0) * ty.amount, 0);
  const lines = types.filter((ty) => (counts[ty.id] ?? 0) > 0);

  return (
    <div className="grid gap-8 border border-line bg-card p-6 md:grid-cols-[1.2fr_1fr] md:p-8">
      <ul className="divide-y divide-line">
        {types.map((ty) => (
          <li key={ty.id} className="flex items-center justify-between gap-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink">{tx(ty.label, locale)}</p>
              <p className="data-lg text-ink-muted">{formatPrice(ty.amount, locale)}</p>
            </div>
            <QuantityStepper value={counts[ty.id] ?? 0} onChange={(n) => setCounts({ ...counts, [ty.id]: n })} />
          </li>
        ))}
      </ul>
      <div className="on-block flex flex-col justify-between p-6">
        <div>
          <p className="eyebrow">{t("pfandTotal")}</p>
          <m.p key={total} initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.24, ease: EASE }} className="display num mt-3 text-[3.5rem] leading-none text-block-bio">
            {formatPrice(total, locale)}
          </m.p>
          <ul className="data mt-5 space-y-1.5 text-block-muted">
            {lines.length === 0 ? <li>0 × …</li> : lines.map((ty) => <li key={ty.id}>{counts[ty.id]} × {formatPrice(ty.amount, locale)} = {formatPrice(counts[ty.id] * ty.amount, locale)}</li>)}
          </ul>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12px] text-block-muted">{t("pfandHint")}</p>
          <Cta variant="ghost" size="sm" arrow={false} onClick={() => setCounts({})}>{t("pfandReset")}</Cta>
        </div>
      </div>
    </div>
  );
}
