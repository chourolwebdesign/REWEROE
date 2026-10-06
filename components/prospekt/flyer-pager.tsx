"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useImperativeHandle, useRef, useState, type KeyboardEvent, type Ref } from "react";
import { nearPages, pageLabel, pagerTarget } from "@/lib/prospekt/pager";
import type { FlyerRecord } from "@/lib/prospekt/select";
import { cn } from "@/lib/utils";
import { FlyerImage } from "./flyer-image";

export interface PagerHandle {
  /** Leiste ohne Animation auf diese Seite stellen (Seiten ab 1) */
  show(page: number): void;
  /** Fokus auf die Schaltfläche dieser Seite */
  focus(page: number): void;
}

const SPREADS = "(min-width: 64rem)";
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const NAV_BTN =
  "inline-flex min-h-11 items-center gap-1.5 rounded-full bg-soft px-4 font-semibold transition-transform duration-150 active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100";

/**
 * Blätter-Ansicht: waagerechte Leiste mit Scroll-Snap. Bis 1024 px eine Seite je Schritt, darüber die Titelseite allein und
 * danach Doppelseiten wie im gedruckten Prospekt (nur CSS). Bilder laden nur in der Nähe der sichtbaren Seiten;
 * Antippen öffnet die Vergrößerung. Darunter Pfeile mit Seitenanzeige und eine Vorschau-Leiste zum Springen.
 */
export function FlyerPager({ flyer, onOpen, ref }: { flyer: FlyerRecord; onOpen: (page: number) => void; ref?: Ref<PagerHandle> }) {
  const total = flyer.page_count;
  const track = useRef<HTMLUListElement>(null);
  const strip = useRef<HTMLUListElement>(null);
  const [visible, setVisible] = useState<number[]>([1]);
  const [loaded, setLoaded] = useState<number[]>(() => nearPages([1], total));

  const scrollToPage = useCallback(
    (page: number, smooth: boolean) => {
      const t = track.current;
      const target = pagerTarget(page, total, window.matchMedia(SPREADS).matches);
      const item = t?.querySelector<HTMLElement>(`[data-pager-page="${target}"]`);
      if (t && item) t.scrollTo({ left: item.offsetLeft, behavior: smooth && !reduced() ? "smooth" : "auto" });
    },
    [total],
  );

  useImperativeHandle(
    ref,
    () => ({
      show: (page) => scrollToPage(page, false),
      focus: (page) => track.current?.querySelector<HTMLElement>(`[data-pager-page="${page}"] button`)?.focus({ preventScroll: true }),
    }),
    [scrollToPage],
  );

  // sichtbare Seiten (≥ 60 % in der Leiste) → Anzeige, Pfeile, Vorschau-Leiste und nachzuladende Bilder
  useEffect(() => {
    const t = track.current;
    if (!t) return;
    const shown = new Set<number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const p = Number((e.target as HTMLElement).dataset.pagerPage);
          if (e.isIntersecting) shown.add(p);
          else shown.delete(p);
        }
        if (!shown.size) return;
        const now = [...shown].sort((a, b) => a - b);
        setVisible(now);
        setLoaded((prev) => [...new Set([...prev, ...nearPages(now, total)])]);
      },
      { root: t, threshold: 0.6 },
    );
    t.querySelectorAll("[data-pager-page]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [total]);

  // aktuelle Seite in der Vorschau-Leiste sichtbar halten – nur waagerecht, die Seite selbst scrollt nicht
  useEffect(() => {
    const s = strip.current;
    const thumb = s?.querySelector<HTMLElement>(`[data-strip-page="${visible[0]}"]`);
    if (s && thumb) s.scrollTo({ left: thumb.offsetLeft - s.clientWidth / 2 + thumb.clientWidth / 2, behavior: reduced() ? "auto" : "smooth" });
  }, [visible]);

  const step = (dir: 1 | -1) => {
    const t = track.current;
    if (t) t.scrollBy({ left: dir * t.clientWidth, behavior: reduced() ? "auto" : "smooth" });
  };
  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    step(e.key === "ArrowRight" ? 1 : -1);
  };
  const pages = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <section aria-label="Prospektseiten" className="mt-6">
      <ul
        ref={track}
        onKeyDown={onKeyDown}
        className="relative flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {pages.map((p) => (
          <li
            key={p}
            data-pager-page={p}
            className={cn(
              "flex w-full shrink-0 snap-start justify-center px-1",
              p === 1 ? "lg:w-full" : "lg:w-1/2",
              p > 1 && (p % 2 === 0 ? "lg:justify-end" : "lg:snap-align-none lg:justify-start"),
            )}
          >
            <button
              type="button"
              data-flyer-page
              onClick={() => onOpen(p)}
              aria-label={`Prospektseite ${p} von ${total} vergrößern`}
              className="block w-full overflow-hidden rounded-xl bg-white ring-1 ring-line lg:w-auto"
            >
              {loaded.includes(p) ? (
                <FlyerImage
                  flyer={flyer}
                  page={p}
                  size="full"
                  sizes="(min-width: 64rem) 40vw, 92vw"
                  priority={p === 1}
                  className="h-auto w-full lg:h-[min(78svh,56rem)] lg:w-auto"
                />
              ) : (
                <span aria-hidden className="block w-full bg-soft lg:h-[min(78svh,56rem)] lg:w-auto" style={{ aspectRatio: `${flyer.page_width} / ${flyer.page_height}` }} />
              )}
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button type="button" onClick={() => step(-1)} disabled={visible[0] === 1} className={NAV_BTN}>
          <ChevronLeft className="size-5" aria-hidden /> Zurück
        </button>
        <p aria-live="polite" className="font-semibold tabular-nums">
          {pageLabel(visible, total)}
        </p>
        <button type="button" onClick={() => step(1)} disabled={visible.includes(total)} className={NAV_BTN}>
          Weiter <ChevronRight className="size-5" aria-hidden />
        </button>
      </div>

      <nav aria-label="Seiten im Überblick" className="mt-4">
        <ul ref={strip} className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {pages.map((p) => (
            <li key={p} data-strip-page={p} className="shrink-0">
              <button
                type="button"
                onClick={() => scrollToPage(p, true)}
                aria-current={visible.includes(p) ? "true" : undefined}
                aria-label={`Seite ${p}`}
                className={cn("block w-12 overflow-hidden rounded-md ring-2 sm:w-14", visible.includes(p) ? "ring-red" : "ring-transparent")}
              >
                <FlyerImage flyer={flyer} page={p} size="thumb" sizes="56px" alt="" className="h-auto w-full" />
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
