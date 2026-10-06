"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useImperativeHandle, useRef, useState, type KeyboardEvent, type Ref } from "react";
import { nearPages, pageLabel, pagerTarget, usesSpreads } from "@/lib/prospekt/pager";
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
/** Fokusrahmen nach innen: die waagerechten Leisten schneiden alles ab, was über die Schaltfläche hinausragt */
const INSET_FOCUS = "focus-visible:outline-offset-[-4px]";

/**
 * Blätter-Ansicht: waagerechte Leiste mit Scroll-Snap. Bis 1024 px eine Seite je Schritt, darüber die Titelseite allein und
 * danach Doppelseiten wie im gedruckten Prospekt (nur CSS); bei gerader Seitenzahl steht die letzte Seite allein links an der
 * Mitte, Querformat blättert einzeln. Bilder laden nur in der Nähe der sichtbaren Seiten; Antippen öffnet die Vergrößerung.
 * Darunter Pfeile mit Seitenanzeige (angesagt erst, wenn die Leiste steht) und eine Vorschau-Leiste zum Springen.
 */
export function FlyerPager({ flyer, onOpen, ref }: { flyer: FlyerRecord; onOpen: (page: number) => void; ref?: Ref<PagerHandle> }) {
  const total = flyer.page_count;
  const portrait = usesSpreads(flyer.page_width, flyer.page_height);
  // gerade Seitenzahl: die letzte Seite steht wie die Rückseite allein links an der Mitte (sonst bliebe am Ende eine Lücke)
  const lastAlone = portrait && total > 1 && total % 2 === 0;
  const track = useRef<HTMLUListElement>(null);
  const strip = useRef<HTMLUListElement>(null);
  const [visible, setVisible] = useState<number[]>([1]);
  // bis zum Laden der Seite nur die Titelseite (der LCP teilt sich die Leitung nicht), danach auch die Nachbarn und die Vorschau-Leiste
  const [loaded, setLoaded] = useState<number[]>([1]);
  const [stripReady, setStripReady] = useState(false);
  const ready = useRef(false);
  const visibleRef = useRef<number[]>([1]);
  // Seitenanzeige erst, wenn die Leiste steht – sonst sagt sie beim weichen Blättern Zwischenstände wie „Seite 1–2“ an
  const [settled, setSettled] = useState<number[]>([1]);
  const settleTimer = useRef(0);
  const settleSoon = useCallback(() => {
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => setSettled(visibleRef.current), 150);
  }, []);

  const scrollToPage = useCallback(
    (page: number, smooth: boolean) => {
      const t = track.current;
      const target = pagerTarget(page, total, portrait && window.matchMedia(SPREADS).matches);
      const item = t?.querySelector<HTMLElement>(`[data-pager-page="${target}"]`);
      if (t && item) t.scrollTo({ left: item.offsetLeft, behavior: smooth && !reduced() ? "smooth" : "auto" });
    },
    [total, portrait],
  );

  useImperativeHandle(
    ref,
    () => ({
      show: (page) => scrollToPage(page, false),
      focus: (page) => track.current?.querySelector<HTMLElement>(`[data-pager-page="${page}"] button`)?.focus({ preventScroll: true }),
    }),
    [scrollToPage],
  );

  useEffect(() => {
    let idle = 0;
    const start = () => {
      idle = window.setTimeout(() => {
        ready.current = true;
        setStripReady(true);
        setLoaded((prev) => [...new Set([...prev, ...nearPages(visibleRef.current, total)])]);
      }, 200);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.clearTimeout(idle);
      window.removeEventListener("load", start);
    };
  }, [total]);

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
        visibleRef.current = now;
        setVisible(now);
        settleSoon();
        setLoaded((prev) => [...new Set([...prev, ...(ready.current ? nearPages(now, total) : now)])]);
      },
      { root: t, threshold: 0.6 },
    );
    t.querySelectorAll("[data-pager-page]").forEach((el) => io.observe(el));
    t.addEventListener("scroll", settleSoon, { passive: true });
    return () => {
      io.disconnect();
      t.removeEventListener("scroll", settleSoon);
      window.clearTimeout(settleTimer.current);
    };
  }, [total, settleSoon]);

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
  // Pfeiltasten auf einer Seite: zur nächsten (Doppel-)Seite und den Fokus mitnehmen – Enter vergrößert dann, was man sieht
  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const cur = visibleRef.current;
    const next = e.key === "ArrowRight" ? Math.max(...cur) + 1 : Math.min(...cur) - 1;
    if (next < 1 || next > total) return;
    const target = pagerTarget(next, total, portrait && window.matchMedia(SPREADS).matches);
    scrollToPage(target, true);
    track.current?.querySelector<HTMLElement>(`[data-pager-page="${target}"] button`)?.focus({ preventScroll: true });
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
              portrait && p > 1 && !(lastAlone && p === total) && (p % 2 === 0 ? "lg:w-1/2 lg:justify-end" : "lg:w-1/2 lg:snap-align-none lg:justify-start"),
              lastAlone && p === total && "lg:justify-end lg:pr-[50%]",
            )}
          >
            <button
              type="button"
              data-flyer-page
              onClick={() => onOpen(p)}
              tabIndex={visible.includes(p) ? 0 : -1}
              aria-label={`Prospektseite ${p} von ${total} vergrößern`}
              className={cn("block w-full overflow-hidden rounded-xl bg-white ring-1 ring-line", portrait && "lg:w-auto", INSET_FOCUS)}
            >
              {loaded.includes(p) ? (
                <FlyerImage
                  flyer={flyer}
                  page={p}
                  size="full"
                  sizes={portrait ? "(min-width: 64rem) 40vw, 92vw" : "92vw"}
                  priority={p === 1}
                  className={cn("h-auto w-full", portrait && "lg:h-[min(78svh,56rem)] lg:w-auto")}
                />
              ) : (
                <span
                  aria-hidden
                  className={cn("block w-full bg-soft", portrait && "lg:h-[min(78svh,56rem)] lg:w-auto")}
                  style={{ aspectRatio: `${flyer.page_width} / ${flyer.page_height}` }}
                />
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
          {pageLabel(settled, total)}
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
                className={cn("block w-12 overflow-hidden rounded-md ring-2 sm:w-14", visible.includes(p) ? "ring-red" : "ring-transparent", INSET_FOCUS)}
              >
                {stripReady ? (
                  <FlyerImage flyer={flyer} page={p} size="thumb" sizes="56px" alt="" className="h-auto w-full" />
                ) : (
                  <span aria-hidden className="block w-full bg-soft" style={{ aspectRatio: `${flyer.page_width} / ${flyer.page_height}` }} />
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
