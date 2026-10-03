"use client";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, Check } from "lucide-react";
import { usePrefs } from "@/lib/store/prefs";
import { Cta } from "@/components/brand/cta";
import { cn } from "@/lib/utils";
import { tx, type L10n } from "@/lib/l10n";

export interface StoreLite { slug: string; name: string; district: string; city: string; zip: string; intro: L10n }

/** Signature feature: choose "Meine Filiale" → site personalises regional products & offers. */
export function StoreSelector({ stores, className, compact }: { stores: StoreLite[]; className?: string; compact?: boolean }) {
  const t = useTranslations("home");
  const locale = useLocale();
  const storeSlug = usePrefs((s) => s.storeSlug);
  const setStore = usePrefs((s) => s.setStore);
  const [q, setQ] = useState("");
  const chosen = stores.find((s) => s.slug === storeSlug);

  const matches = useMemo(() => {
    const n = q.trim().toLowerCase();
    return stores.filter((s) => !n || `${s.name} ${s.district} ${s.city} ${s.zip}`.toLowerCase().includes(n));
  }, [q, stores]);

  if (chosen) {
    return (
      <div className={cn("rounded-[14px] border border-rewe/50 bg-card p-5 shadow-card", className)}>
        <p className="eyebrow mb-2 flex items-center gap-2"><Check className="h-3.5 w-3.5 text-rewe" /> {t("storeChosen")}</p>
        <p className="serif text-2xl">{chosen.name}</p>
        <p className="text-sm text-ink-muted">{chosen.district} · {chosen.zip} {chosen.city}</p>
        {!compact && <p className="mt-3 text-sm text-ink-muted">{tx(chosen.intro, locale)}</p>}
        <button type="button" onClick={() => setStore(null)} className="mono mt-4 text-[11px] uppercase tracking-widest underline-offset-4 hover:underline">{t("storeChange")}</button>
      </div>
    );
  }

  return (
    <div className={cn("rounded-[14px] border border-line bg-card p-5 shadow-card", className)}>
      <label className="relative block">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("storeSearch")} className="h-12 w-full rounded-[10px] border border-line bg-surface pl-10 pr-3 outline-none focus:border-gold" aria-label={t("storeSearch")} />
      </label>
      <ul className="mt-3 space-y-2">
        {matches.map((s) => (
          <li key={s.slug} className="flex items-center justify-between gap-3 rounded-[10px] border border-line px-4 py-3">
            <div><p className="font-medium">{s.name}</p><p className="mono text-[11px] text-ink-muted">{s.zip} {s.city}-{s.district}</p></div>
            <Cta size="sm" arrow={false} onClick={() => setStore(s.slug)}>{t("storeChoose")}</Cta>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Renders children only when a store is selected (client-side personalisation). */
export function WhenStoreChosen({ children, slug }: { children: React.ReactNode; slug?: string }) {
  const storeSlug = usePrefs((s) => s.storeSlug);
  if (!storeSlug || (slug && storeSlug !== slug)) return null;
  return <>{children}</>;
}
