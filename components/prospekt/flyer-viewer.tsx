"use client";

import "photoswipe/style.css";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { linkTarget, type FlyerRecord } from "@/lib/prospekt/select";
import { FlyerImage, flyerMiniSrc, flyerZoomSrc } from "./flyer-image";
import { cn } from "@/lib/utils";

export interface ViewerWeek {
  key: "current" | "next";
  label: string;
  kw: number;
  range: string;
  flyer: FlyerRecord;
}

/** ?kw=&seite= in der Adresse: ein geteilter Link öffnet dieselbe Seite desselben Prospekts. */
function setPageParam(kw: number, n: number | null) {
  const url = new URL(location.href);
  if (n) {
    url.searchParams.set("kw", String(kw));
    url.searchParams.set("seite", String(n));
  } else {
    url.searchParams.delete("kw");
    url.searchParams.delete("seite");
  }
  history.replaceState(history.state, "", url);
}

const noSubscribe = () => () => {};
const readSearch = () => location.search;

/**
 * Prospekt als Seitenraster (Titelseite groß) und Vollbild-Viewer (PhotoSwipe, erst beim Öffnen geladen):
 * Wischen, Zoom, Pfeiltasten; Woche und Seite stehen als ?kw=&seite= in der Adresse und lassen sich teilen.
 */
export function FlyerViewer({ weeks, defaultTab }: { weeks: ViewerWeek[]; defaultTab: "current" | "next" }) {
  // Woche aus einem geteilten Link – auf dem Server der vorausgewählte Reiter, im Browser nach dem Hydrieren der aus ?kw=
  const search = useSyncExternalStore(noSubscribe, readSearch, () => "");
  const linkWeeks = weeks.map((w) => ({ key: w.key, kw: w.kw, pages: w.flyer.page_count }));
  const [chosen, setChosen] = useState<ViewerWeek["key"] | null>(null);
  const tab = chosen ?? linkTarget(search, linkWeeks, defaultTab).tab;
  const week = weeks.find((w) => w.key === tab) ?? weeks[0];
  const { flyer } = week;
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const open = useCallback(
    async ({ flyer, kw }: ViewerWeek, index: number) => {
      const { default: PhotoSwipeLightbox } = await import("photoswipe/lightbox");
      let current = index;
      const lightbox = new PhotoSwipeLightbox({
        dataSource: Array.from({ length: flyer.page_count }, (_, i) => ({
          src: flyerZoomSrc(flyer, i + 1),
          msrc: flyerMiniSrc(flyer, i + 1),
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
        setPageParam(kw, current + 1);
      });
      lightbox.on("destroy", () => {
        setPageParam(kw, null);
        buttons.current[current]?.focus();
      });
      lightbox.init();
      lightbox.loadAndOpen(index);
      setPageParam(kw, index + 1);
    },
    [],
  );

  // Geteilter Link mit ?kw=&seite=: beim ersten Aufruf direkt diese Seite öffnen
  useEffect(() => {
    const target = linkTarget(location.search, linkWeeks, defaultTab);
    const linked = weeks.find((w) => w.key === target.tab);
    if (linked && target.page) void open(linked, target.page - 1);
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
              onClick={() => setChosen(w.key)}
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
              onClick={() => open(week, i)}
              className="group block w-full overflow-hidden rounded-2xl bg-white ring-1 ring-line transition-transform duration-150 active:scale-[0.98]"
              aria-label={`Prospektseite ${i + 1} von ${flyer.page_count} vergrößern`}
            >
              <FlyerImage
                flyer={flyer}
                page={i + 1}
                size="thumb"
                sizes={i === 0 ? "(min-width: 64rem) 46vw, (min-width: 40rem) 62vw, 92vw" : "(min-width: 64rem) 22vw, (min-width: 40rem) 30vw, 45vw"}
                priority={i === 0}
                className="h-auto w-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[1.02]"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
