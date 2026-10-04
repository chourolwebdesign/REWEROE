"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { AlertCircle, Check, Clock, LocateFixed, MapPin } from "lucide-react";
import { usePrefs } from "@/lib/store/prefs";
import { useMounted, useTick } from "@/lib/hooks";
import { Cta } from "@/components/brand/cta";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import type { L10n } from "@/lib/l10n";
import { berlinParts, formatOpenState, openState, type Hours, type HoursStatus } from "@/lib/hours";
import type { Weekday } from "@/lib/content/types";
import type { MapStore } from "./store-map-inner";

const StoreMap = dynamic(() => import("./store-map-inner"), { ssr: false, loading: () => <div className="h-full w-full bg-surface-2" aria-hidden /> });

export interface FinderStore extends MapStore {
  district: string; zip: string; city: string; addressPending: boolean; hoursPending: boolean;
  hours: Hours; services: string[]; intro: L10n;
}

/** Client-only Leaflet map for the finder and the Filiale page. The caller gives it a `frame` and a height. */
export function StoreMapLazy({ stores, user = null, active }: { stores: MapStore[]; user?: [number, number] | null; active?: string | null }) {
  return <StoreMap stores={stores} user={user} active={active} />;
}

/** „Meine Filiale" — persisted via usePrefs (zustand). Primary until chosen, then secondary with a check. */
export function MyStoreButton({ slug, className }: { slug: string; className?: string }) {
  const t = useTranslations("stores");
  const mounted = useMounted();
  const storeSlug = usePrefs((s) => s.storeSlug);
  const setStore = usePrefs((s) => s.setStore);
  const mine = mounted && storeSlug === slug;
  return (
    <Cta variant={mine ? "secondary" : "primary"} size="sm" arrow={false} onClick={() => setStore(mine ? null : slug)} aria-pressed={mine} className={className}>
      <span className="inline-flex items-center gap-2">{mine && <Check className="h-4 w-4" aria-hidden />}{mine ? t("isMyStore") : t("myStore")}</span>
    </Cta>
  );
}

const DAY_ORDER: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/**
 * Öffnungszeiten `dl` (§4.40): Mo…So, today highlighted with the open/closed dot, live line from `formatOpenState`.
 * Hydration-safe: today and the live state render after mount. While `hoursStatus === "pending"` no table is published —
 * only the pending line (the header chip, hero chip and footer say the same).
 */
export function StoreHours({ hours, hoursStatus, className }: { hours: Hours; hoursStatus: HoursStatus; className?: string }) {
  const tc = useTranslations("common");
  const ts = useTranslations("stores");
  const mounted = useMounted();
  const [announce, setAnnounce] = useState(false);
  useTick(30_000);
  // The live line is empty on SSR and filled on mount; `aria-live` is switched on one frame later so the initial fill is not announced.
  useEffect(() => {
    if (!mounted) return;
    const id = requestAnimationFrame(() => setAnnounce(true));
    return () => cancelAnimationFrame(id);
  }, [mounted]);
  const today = mounted ? berlinParts(new Date()).weekday : null;
  const state = hoursStatus === "pending" ? openState(hours, "pending") : mounted ? openState(hours, hoursStatus) : null;
  const live = state ? formatOpenState(state, tc) : null;
  if (hoursStatus === "pending") {
    return (
      <div className={className}>
        <p className="text-[15px] font-medium text-ink-muted">{tc("hoursPendingShort")}</p>
        <p className="mt-2 text-[13px] text-ink-muted">{ts("hoursPending")}</p>
      </div>
    );
  }
  return (
    <div className={className}>
      <dl className="num divide-y divide-line text-sm">
        {DAY_ORDER.map((d) => {
          const h = hours[d];
          const isToday = d === today;
          return (
            <div key={d} className={cn("flex items-center justify-between gap-4 py-2.5", isToday ? "-mx-2 bg-surface px-2 font-semibold text-ink" : "text-ink-muted")}>
              <dt className="flex items-center gap-2">
                {isToday && state && state.kind !== "pending" && <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", state.kind === "open" ? "bg-bio-text" : "bg-ink-muted")} aria-hidden />}
                {tc(`weekdays.${d}`)}
              </dt>
              <dd>{h ? `${h[0]} – ${h[1]}` : tc("closed")}</dd>
            </div>
          );
        })}
      </dl>
      <p className={cn("mt-4 min-h-5 text-[13px] font-medium", live?.tone === "open" ? "text-bio-text" : live?.tone === "closed" ? "text-ink" : "text-ink-muted")} aria-live={announce ? "polite" : undefined}>
        {live?.text ?? " "}
      </p>
    </div>
  );
}

function km(a: [number, number], b: [number, number]) {
  const R = 6371, dLat = ((b[0] - a[0]) * Math.PI) / 180, dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

/** Store finder: list of hairline cards beside the greyscale map; „Meine Filiale" card carries a 3 px red left edge. */
export function StoreFinder({ stores }: { stores: FinderStore[] }) {
  const t = useTranslations("stores");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [user, setUser] = useState<[number, number] | null>(null);
  const [geo, setGeo] = useState<"idle" | "loading" | "denied">("idle");
  const mounted = useMounted();
  useTick(30_000);
  const storeSlug = usePrefs((s) => s.storeSlug);

  const locate = () => {
    if (!navigator.geolocation) return setGeo("denied");
    setGeo("loading");
    navigator.geolocation.getCurrentPosition((pos) => { setUser([pos.coords.latitude, pos.coords.longitude]); setGeo("idle"); }, () => setGeo("denied"), { timeout: 8000 });
  };
  const sorted = useMemo(() => (user ? [...stores].sort((a, b) => km(user, a.coords) - km(user, b.coords)) : stores), [stores, user]);

  return (
    <div className="grid min-h-[70vh] lg:grid-cols-[420px_1fr]">
      <aside className="order-2 space-y-4 p-5 lg:order-1 lg:max-h-[80vh] lg:overflow-y-auto lg:border-r lg:border-line">
        <h2 className="sr-only">{t("mapTitle")}</h2>
        <Cta variant="secondary" size="sm" arrow={false} onClick={locate} className="w-full" aria-busy={geo === "loading"}>
          <span className="inline-flex items-center gap-2"><LocateFixed className={cn("h-4 w-4", geo === "loading" && "animate-spin")} aria-hidden />{geo === "loading" ? t("locating") : t("near")}</span>
        </Cta>
        {geo === "denied" && <p className="flex items-center gap-1.5 text-[12px] font-medium text-error" role="status"><AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />{t("geoDenied")}</p>}
        {sorted.map((s) => {
          const st = s.hoursPending ? openState(s.hours, "pending") : mounted ? openState(s.hours, "published") : null;
          const live = st ? formatOpenState(st, tc) : null;
          const mine = mounted && storeSlug === s.slug;
          return (
            <article key={s.slug} className={cn("border border-line bg-card p-5 transition-colors duration-[var(--dur-ui)]", mine && "border-l-[3px] border-l-red")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">{s.city}</p>
                  <h3 className="mt-1 text-ink">{s.name}</h3>
                </div>
                {st && st.kind !== "pending" && (
                  <span className={cn("inline-flex min-h-7 shrink-0 items-center rounded-[2px] px-2 text-[12px] font-medium", st.kind === "open" ? "bg-bio-tint text-bio-text" : "bg-surface-2 text-ink-muted")}>
                    {st.kind === "open" ? t("openNow") : t("closedNow")}
                  </span>
                )}
              </div>
              <p className="mt-3 flex items-start gap-2 text-sm text-ink-muted"><MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{s.addressPending ? `${t("addressPending")} · ${s.zip} ${s.city}-${s.district}` : s.address}</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-ink-muted">
                <Clock className="h-4 w-4 shrink-0" aria-hidden />
                <span className={cn(live?.tone === "open" && "text-bio-text")}>{live?.text ?? "—"}</span>
                {user && <span className="num">· {t("distanceAway", { km: formatNumber(km(user, s.coords), locale, { maximumFractionDigits: 1 }) })}</span>}
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={t("services")}>
                {s.services.map((sv) => <li key={sv} className="rounded-[2px] border border-line px-2 py-1 text-[12px] font-medium text-ink-muted">{tc(`services.${sv}`)}</li>)}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <Cta href={`/filialen/${s.slug}`} size="sm" variant="secondary">{t("details")}</Cta>
                <MyStoreButton slug={s.slug} />
              </div>
            </article>
          );
        })}
      </aside>
      <div className="order-1 h-[46vh] lg:order-2 lg:h-auto lg:min-h-[80vh]">
        <StoreMapLazy stores={stores} user={user} active={storeSlug} />
        {user && <p className="sr-only">{t("yourPosition")}</p>}
      </div>
    </div>
  );
}
