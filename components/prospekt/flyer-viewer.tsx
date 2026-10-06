"use client";

import "photoswipe/style.css";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { linkTarget, type FlyerRecord } from "@/lib/prospekt/select";
import { FlyerImage, flyerMiniSrc, flyerZoomSrc } from "./flyer-image";
import { cn } from "@/lib/utils";
import { ShareButton } from "@/components/ui/share-button";
import { FlyerPager, type PagerHandle } from "./flyer-pager";

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
 * Prospekt als Blätter-Ansicht (FlyerPager), Übersicht aller Seiten zum Aufklappen und Vollbild-Viewer (PhotoSwipe, erst beim Öffnen geladen):
 * Wischen, Zoom, Pfeiltasten; Woche und Seite stehen als ?kw=&seite= in der Adresse und lassen sich teilen.
 */
export function FlyerViewer({ weeks, defaultTab, shareUrl }: { weeks: ViewerWeek[]; defaultTab: "current" | "next"; shareUrl: string }) {
  // Woche aus einem geteilten Link – auf dem Server der vorausgewählte Reiter, im Browser nach dem Hydrieren der aus ?kw=
  const search = useSyncExternalStore(noSubscribe, readSearch, () => "");
  const linkWeeks = weeks.map((w) => ({ key: w.key, kw: w.kw, pages: w.flyer.page_count }));
  const [chosen, setChosen] = useState<ViewerWeek["key"] | null>(null);
  const tab = chosen ?? linkTarget(search, linkWeeks, defaultTab).tab;
  const week = weeks.find((w) => w.key === tab) ?? weeks[0];
  const { flyer } = week;
  const pager = useRef<PagerHandle>(null);

  const open = useCallback(
    async ({ flyer, kw }: ViewerWeek, index: number, from: "pager" | "grid" = "pager") => {
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
        pager.current?.show(current + 1);
        // Fokus dorthin zurück, wo geöffnet wurde: in der Übersicht „Alle Seiten“ oder in der Blätter-Leiste
        if (from === "grid") document.querySelector<HTMLElement>(`[data-flyer-grid-page="${current + 1}"]`)?.focus();
        else pager.current?.focus(current + 1);
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
    if (linked && target.page) {
      pager.current?.show(target.page);
      void open(linked, target.page - 1);
    }
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
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold">
          KW {week.kw} · {week.range}
        </p>
        <ShareButton url={shareUrl} title="Prospekt der Woche – REWE Rödelheim" text={`Die Angebote bei REWE Rödelheim (KW ${week.kw}):`} label="Teilen" size="sm" />
      </div>
      <FlyerPager key={flyer.id} ref={pager} flyer={flyer} onOpen={(p) => void open(week, p - 1)} />
      <details className="group mt-8 rounded-[1.5rem] bg-soft p-4 md:p-6">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-semibold [&::-webkit-details-marker]:hidden">
          Alle {flyer.page_count} Seiten ansehen
          <ChevronDown className="size-5 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
        </summary>
        <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:gap-3 lg:grid-cols-6">
          {Array.from({ length: flyer.page_count }, (_, i) => (
            <li key={`${flyer.id}-${i}`}>
              <button
                type="button"
                data-flyer-grid-page={i + 1}
                onClick={() => void open(week, i, "grid")}
                className="block w-full overflow-hidden rounded-xl bg-white ring-1 ring-line transition-transform duration-150 active:scale-[0.98]"
                aria-label={`Prospektseite ${i + 1} von ${flyer.page_count} vergrößern`}
              >
                <FlyerImage flyer={flyer} page={i + 1} size="thumb" sizes="(min-width: 64rem) 15vw, (min-width: 40rem) 23vw, 31vw" className="h-auto w-full" />
              </button>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
