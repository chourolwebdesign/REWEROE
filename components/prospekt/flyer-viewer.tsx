"use client";

import "photoswipe/style.css";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FlyerRecord } from "@/lib/prospekt/select";
import { flyerImage } from "@/lib/prospekt/urls";
import { cn } from "@/lib/utils";

export interface ViewerWeek {
  key: "current" | "next";
  label: string;
  kw: number;
  range: string;
  flyer: FlyerRecord;
}

function setPageParam(n: number | null) {
  const url = new URL(location.href);
  if (n) url.searchParams.set("seite", String(n));
  else url.searchParams.delete("seite");
  history.replaceState(history.state, "", url);
}

/**
 * Prospekt als Seitenraster (Titelseite groß) und Vollbild-Viewer (PhotoSwipe, erst beim Öffnen geladen):
 * Wischen, Zoom, Pfeiltasten; die aktuelle Seite steht als ?seite= in der Adresse und lässt sich teilen.
 */
export function FlyerViewer({ weeks, defaultTab }: { weeks: ViewerWeek[]; defaultTab: "current" | "next" }) {
  const [tab, setTab] = useState(weeks.find((w) => w.key === defaultTab)?.key ?? weeks[0].key);
  const week = weeks.find((w) => w.key === tab) ?? weeks[0];
  const { flyer } = week;
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const open = useCallback(
    async (index: number) => {
      const { default: PhotoSwipeLightbox } = await import("photoswipe/lightbox");
      let current = index;
      const lightbox = new PhotoSwipeLightbox({
        dataSource: Array.from({ length: flyer.page_count }, (_, i) => ({
          src: flyerImage(flyer, i + 1, "full"),
          msrc: flyerImage(flyer, i + 1, "thumb"),
          width: flyer.page_width,
          height: flyer.page_height,
          alt: `Prospektseite ${i + 1} von ${flyer.page_count}`,
        })),
        pswpModule: () => import("photoswipe"),
        index,
        bgOpacity: 0.94,
        returnFocus: false,
        closeTitle: "Schließen",
        zoomTitle: "Vergrößern",
        arrowPrevTitle: "Vorherige Seite",
        arrowNextTitle: "Nächste Seite",
        errorMsg: "Diese Seite konnte nicht geladen werden.",
      });
      lightbox.on("change", () => {
        current = lightbox.pswp?.currIndex ?? current;
        setPageParam(current + 1);
      });
      lightbox.on("destroy", () => {
        setPageParam(null);
        buttons.current[current]?.focus();
      });
      lightbox.init();
      lightbox.loadAndOpen(index);
      setPageParam(index + 1);
    },
    [flyer],
  );

  // Geteilter Link mit ?seite=: beim ersten Aufruf direkt diese Seite öffnen
  useEffect(() => {
    const n = Number(new URLSearchParams(location.search).get("seite"));
    if (n >= 1 && n <= flyer.page_count) void open(n - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- nur beim ersten Aufruf
  }, []);

  return (
    <div>
      {weeks.length > 1 && (
        <div role="tablist" aria-label="Prospektwoche" className="inline-flex rounded-full bg-soft p-1">
          {weeks.map((w) => (
            <button
              key={w.key}
              role="tab"
              type="button"
              aria-selected={w.key === tab}
              onClick={() => setTab(w.key)}
              className={cn("min-h-11 rounded-full px-5 font-semibold transition-colors", w.key === tab ? "bg-white text-ink shadow-[var(--shadow-soft)]" : "text-muted hover:text-ink")}
            >
              {w.label}
            </button>
          ))}
        </div>
      )}
      <p className="mt-5 font-semibold">
        KW {week.kw} · {week.range}
      </p>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {Array.from({ length: flyer.page_count }, (_, i) => (
          <li key={`${flyer.id}-${i}`} className={cn(i === 0 && "col-span-2 row-span-2")}>
            <button
              ref={(el) => {
                buttons.current[i] = el;
              }}
              type="button"
              data-flyer-page
              onClick={() => open(i)}
              className="group block w-full overflow-hidden rounded-2xl bg-white ring-1 ring-line transition-transform duration-150 active:scale-[0.98]"
              aria-label={`Prospektseite ${i + 1} von ${flyer.page_count} vergrößern`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- fertig skaliert (480 px), keine Optimierung nötig */}
              <img
                src={flyerImage(flyer, i + 1, "thumb")}
                width={480}
                height={Math.round((flyer.page_height / flyer.page_width) * 480)}
                alt={`Prospektseite ${i + 1} von ${flyer.page_count}`}
                loading={i < 4 ? "eager" : "lazy"}
                decoding="async"
                className="h-auto w-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[1.02]"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
