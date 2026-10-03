"use client";
import { useMemo, useState } from "react";
import { useMounted } from "@/lib/hooks";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { LocateFixed, MapPin, Clock } from "lucide-react";
import { usePrefs } from "@/lib/store/prefs";
import { Cta } from "@/components/brand/cta";
import { cn } from "@/lib/utils";
import { tx, type L10n } from "@/lib/l10n";
import type { Weekday } from "@/lib/content/types";
import type { MapStore } from "./store-map-inner";

const StoreMap = dynamic(() => import("./store-map-inner"), { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-surface-2" /> });

export interface FinderStore extends MapStore {
  district: string; zip: string; city: string; addressPending: boolean; hoursPending: boolean;
  hours: Record<Weekday, [string, string] | null>; services: string[]; intro: L10n;
}

const dayKeys: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
export function openState(hours: FinderStore["hours"]) {
  const now = new Date();
  const berlin = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
  const day = dayKeys[berlin.getDay()];
  const h = hours[day];
  if (!h) return { open: false, until: null as string | null };
  const mins = berlin.getHours() * 60 + berlin.getMinutes();
  const [o, c] = h.map((x) => { const [hh, mm] = x.split(":").map(Number); return hh * 60 + mm; });
  return mins >= o && mins < c ? { open: true, until: h[1] } : { open: false, until: h[0] };
}

function km(a: [number, number], b: [number, number]) {
  const R = 6371, dLat = ((b[0] - a[0]) * Math.PI) / 180, dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function StoreFinder({ stores }: { stores: FinderStore[] }) {
  const t = useTranslations("stores");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [user, setUser] = useState<[number, number] | null>(null);
  const [geo, setGeo] = useState<"idle" | "loading" | "denied">("idle");
  const mounted = useMounted();
  const storeSlug = usePrefs((s) => s.storeSlug);
  const setStore = usePrefs((s) => s.setStore);

  const locate = () => {
    if (!navigator.geolocation) return setGeo("denied");
    setGeo("loading");
    navigator.geolocation.getCurrentPosition((pos) => { setUser([pos.coords.latitude, pos.coords.longitude]); setGeo("idle"); }, () => setGeo("denied"), { timeout: 8000 });
  };
  const sorted = useMemo(() => (user ? [...stores].sort((a, b) => km(user, a.coords) - km(user, b.coords)) : stores), [stores, user]);

  return (
    <div className="grid min-h-[70vh] lg:grid-cols-[420px_1fr]">
      <aside className="order-2 space-y-4 p-5 lg:order-1 lg:max-h-[80vh] lg:overflow-y-auto">
        <button type="button" onClick={locate} className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-line px-4 py-3 text-sm font-medium transition-colors hover:bg-forest hover:text-cream">
          <LocateFixed className={cn("h-4 w-4", geo === "loading" && "animate-spin")} /> {geo === "loading" ? t("locating") : t("near")}
        </button>
        {geo === "denied" && <p className="mono text-[11px] text-price">{t("geoDenied")}</p>}
        {sorted.map((s) => {
          const st = mounted ? openState(s.hours) : null;
          const mine = storeSlug === s.slug;
          return (
            <article key={s.slug} className={cn("rounded-[14px] border bg-card p-5 shadow-card transition-colors", mine ? "border-rewe" : "border-line")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">{s.city}</p>
                  <h3 className="mt-1 text-forest dark:text-cream">{s.name}</h3>
                </div>
                {st && <span className={cn("mono rounded-full px-2 py-1 text-[10px] uppercase tracking-wider", st.open ? "bg-rewe/20 text-emerald" : "bg-price/10 text-price")}>{st.open ? t("openNow") : t("closedNow")}</span>}
              </div>
              <p className="mt-3 flex items-start gap-2 text-sm text-ink-muted"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {s.addressPending ? `${t("addressPending")} · ${s.zip} ${s.city}-${s.district}` : s.address}</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-ink-muted"><Clock className="h-4 w-4 shrink-0" /> {s.hoursPending ? t("hoursPending") : st ? (st.open ? tc("openUntil", { time: st.until ?? "" }) : st.until ? tc("opensAt", { time: st.until ?? "" }) : tc("closed")) : "—"}{user && ` · ${km(user, s.coords).toFixed(1)} km`}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {s.services.map((sv) => <li key={sv} className="mono rounded-[3px] border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-ink-muted">{tc(`services.${sv}`)}</li>)}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <Cta href={`/filialen/${s.slug}`} size="sm" variant="secondary">{t("details")}</Cta>
                <button type="button" onClick={() => setStore(mine ? null : s.slug)} className={cn("mono rounded-[10px] px-3 py-2 text-[11px] uppercase tracking-wider transition-colors", mine ? "bg-rewe text-forest" : "border border-line hover:bg-forest/5")}>{mine ? `✓ ${t("isMyStore")}` : t("myStore")}</button>
              </div>
            </article>
          );
        })}
      </aside>
      <div className="order-1 h-[46vh] lg:order-2 lg:h-auto lg:min-h-[80vh]">
        <StoreMap stores={stores} user={user} active={storeSlug} />
        <span className="sr-only">{t("mapTitle")}</span>
        {user && <p className="sr-only">{t("yourPosition")}</p>}
      </div>
      <span className="hidden">{tx("", locale)}</span>
    </div>
  );
}
