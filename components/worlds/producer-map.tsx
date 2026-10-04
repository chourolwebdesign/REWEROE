"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { MapProducer, MapStoreMarker } from "./producer-map-inner";

const Inner = dynamic(() => import("./producer-map-inner"), { ssr: false, loading: () => <div className="h-full w-full bg-surface-2" aria-hidden /> });

export interface ProducerListItem extends MapProducer {
  /** 0 km crafts (bakery, butcher's) live inside the store and share its coordinates — listed, not marked. */
  inStore: boolean;
}

interface Props {
  store: Omit<MapStoreMarker, "label" | "note">;
  producers: ProducerListItem[];
  radiusKm: number;
  className?: string;
}

/**
 * Erzeuger-Karte (/regional): Leaflet map in a hairline frame (cols 1–8) with the producer list beside it (cols 9–12).
 * Selecting a list entry flies to its marker and opens the popup; selecting again clears the focus.
 */
export function ProducerMap({ store, producers, radiusKm, className }: Props) {
  const t = useTranslations("regional");
  const [active, setActive] = useState<string | null>(null);
  const farms = producers.filter((p) => !p.inStore);
  const toggle = (slug: string) => setActive((a) => (a === slug ? null : slug));

  return (
    <div className={cn("grid grid-cols-4 gap-x-6 gap-y-8 md:grid-cols-12", className)}>
      <div className="frame relative col-span-4 h-[380px] overflow-hidden bg-surface md:col-span-8 md:h-[560px]" role="region" aria-label={t("mapAria")}>
        <Inner
          store={{ ...store, label: t("mapStore"), note: t("mapStoreNote") }}
          producers={farms}
          radiusKm={radiusKm}
          active={active}
          onSelect={setActive}
        />
      </div>

      <aside className="col-span-4 flex flex-col md:col-span-4">
        <p className="eyebrow">{t("mapList")}</p>
        <ol className="rule-strong mt-4 divide-y divide-line">
          {producers.map((p) => {
            const isActive = active === p.slug;
            return (
              <li key={p.slug}>
                <button
                  type="button"
                  disabled={p.inStore}
                  aria-pressed={p.inStore ? undefined : isActive}
                  aria-label={p.inStore ? undefined : t("showOnMap", { name: p.name })}
                  onClick={() => toggle(p.slug)}
                  className={cn(
                    "-mx-2 flex min-h-14 w-[calc(100%+1rem)] items-center justify-between gap-4 px-2 py-3 text-left transition-colors duration-[var(--dur-ui)] ease-[var(--ease-ui)]",
                    p.inStore ? "cursor-default" : "hover:bg-surface",
                    isActive && "bg-surface",
                  )}
                >
                  <span className="min-w-0">
                    <span className={cn("block truncate text-[15px] leading-snug text-ink", isActive ? "font-semibold" : "font-medium")}>{p.name}</span>
                    <span className="block truncate text-[12px] font-medium text-ink-muted">{p.region}</span>
                  </span>
                  <span className="num shrink-0 text-[13px] text-ink">{p.inStore ? t("inStore") : t("km", { km: p.distanceKm })}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <p className="data mt-5 text-ink-muted">{t("mapLegend", { km: radiusKm })}</p>
      </aside>
    </div>
  );
}
