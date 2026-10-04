"use client";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, Check } from "lucide-react";
import { usePrefs } from "@/lib/store/prefs";
import { Cta } from "@/components/brand/cta";
import { cn } from "@/lib/utils";
import { tx, type L10n } from "@/lib/l10n";

export interface StoreLite { slug: string; name: string; district: string; city: string; zip: string; intro: L10n }

/**
 * Signature feature (§4.20): choose „Meine Filiale" → the site personalises regional products & offers.
 * Hairline panel (radius 0); the primary „Meine Filiale wählen" is the section's one red. Chosen state carries a
 * 3 px red left rule, a Bio-green check and „Ändern" as a ghost action.
 */
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
      <div className={cn("border border-line border-l-[3px] border-l-red bg-card p-5", className)}>
        <p className="eyebrow flex items-center gap-2"><Check className="h-3.5 w-3.5 text-bio-text" aria-hidden /> {t("storeChosen")}</p>
        <p className="display mt-3 text-2xl text-ink">{chosen.name}</p>
        <p className="mt-1 text-sm text-ink-muted">{chosen.district} · {chosen.zip} {chosen.city}</p>
        {!compact && <p className="mt-3 text-sm leading-relaxed text-ink-2">{tx(chosen.intro, locale)}</p>}
        <Cta variant="ghost" size="sm" arrow={false} onClick={() => setStore(null)} className="mt-3 px-0">{t("storeChange")}</Cta>
      </div>
    );
  }

  return (
    <div className={cn("border border-line bg-card p-5", className)}>
      <label className="relative block">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("storeSearch")}
          aria-label={t("storeSearch")}
          className="h-12 w-full rounded-[2px] border border-line-input bg-paper pl-10 pr-3 text-[15px] text-ink outline-none transition-colors duration-[var(--dur-ui)] placeholder:text-ink-muted focus:border-ink"
        />
      </label>
      <ul className="mt-2 divide-y divide-line">
        {matches.map((s) => (
          <li key={s.slug} className="flex items-center justify-between gap-3 py-3">
            <div>
              <p className="text-[15px] font-medium text-ink">{s.name}</p>
              <p className="num text-[12px] text-ink-muted">{s.zip} {s.city}-{s.district}</p>
            </div>
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
