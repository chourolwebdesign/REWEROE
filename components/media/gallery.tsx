"use client";

import Image, { type StaticImageData } from "next/image";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { coverSizes } from "@/lib/sizes";
import { cn } from "@/lib/utils";
import { autoplaySource, type VideoSource } from "@/lib/video";

export type GalleryMedia =
  | { type: "image"; image: StaticImageData; alt: string; caption: string; credit: string }
  | { type: "clip"; sources: readonly VideoSource[]; poster: StaticImageData; alt: string; caption: string; credit: string };

/** Clip in der Kachel: läuft stumm, solange er sichtbar ist – nicht bei reduzierter Bewegung oder im Datensparmodus. */
function TileClip({ sources }: { sources: readonly VideoSource[] }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const v = ref.current;
    const source = autoplaySource(sources);
    if (!v || !source || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.getAttribute("src")) v.src = source;
          v.play().catch(() => {});
        } else v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [sources]);
  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      onPlaying={() => setShown(true)}
      aria-hidden
      className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-500", shown ? "opacity-100" : "opacity-0")}
    />
  );
}

/** Raster je Breite: Spalten, Breite der ersten Kachel und die Klasse, die eine Kachel nur in diesem Bereich ausblendet. */
const LAYOUTS = [
  { cols: 2, featured: 2, hide: "max-sm:hidden" },
  { cols: 3, featured: 3, hide: "sm:max-lg:hidden" },
  { cols: 4, featured: 2, hide: "lg:hidden" },
] as const;
/** Mit `row` ist die Galerie unter 768 px eine waagerechte Reihe (alle Kacheln sichtbar), das Dreier-Raster beginnt erst bei 768 px. */
const ROW_LAYOUTS = [
  { cols: 3, featured: 3, hide: "md:max-lg:hidden" },
  { cols: 4, featured: 2, hide: "lg:hidden" },
] as const;

/** Wie viele Kacheln ein Raster ohne halbe letzte Zeile füllen (die übrigen bleiben über das Vollbild erreichbar). */
function fullRows(n: number, cols: number, featured: number) {
  const rest = (n - 1 + featured) % cols;
  return n - rest >= 2 ? n - rest : n;
}

/**
 * „Aus dem Markt“: kuratiertes Mosaik. Die erste Kachel ist breiter: mobil und ab 1024 px über zwei Spalten,
 * dazwischen (drei Spalten) über die ganze Zeile. Ab 1024 px hat sie kein eigenes Seitenverhältnis, sondern füllt
 * die Höhe der Zeile – so schließt sie bündig mit den Hochkant-Kacheln ab.
 * Die letzte Zeile ist immer voll: Was nicht aufgeht, zeigt nur das Vollbild (7 Einträge passen überall).
 */
export function Gallery({ items, row = false, className }: { items: GalleryMedia[]; row?: boolean; className?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
    if (open === null && d.open) d.close();
  }, [open]);

  const step = (dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + items.length) % items.length));
  const current = open === null ? null : items[open];

  return (
    <>
      <ul className={cn(row ? "max-md:snap-row md:grid md:grid-cols-3 md:gap-4 lg:grid-cols-4" : "grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:gap-4 lg:grid-cols-4", className)}>
        {items.map((it, i) => {
          const img = it.type === "image" ? it.image : it.poster;
          const featured = i === 0;
          // Große erste Kachel im Raster: ein Querformat zeigt auf dem Handy sein eigenes Seitenverhältnis statt 4:5 – nichts wird
          // abgeschnitten (z. B. das Gruppenfoto im Beitrag). Hochkant-Kacheln rechnen den Zuschnitt in `sizes` ein.
          const natural = featured && !row && img.width > img.height;
          const hidden = (row ? ROW_LAYOUTS : LAYOUTS).filter((l) => i >= fullRows(items.length, l.cols, l.featured)).map((l) => l.hide);
          return (
            <li
              key={i}
              className={cn(
                row ? "w-[72%] shrink-0 snap-start md:w-auto" : featured && "col-span-2 sm:col-span-3",
                featured && (row ? "md:col-span-3 lg:col-span-2" : "lg:col-span-2"),
                hidden,
              )}
            >
              <button
                type="button"
                onClick={() => setOpen(i)}
                className={cn(
                  "group relative block w-full overflow-hidden rounded-[1.25rem] bg-soft text-left md:rounded-[1.5rem]",
                  featured
                    ? row
                      ? "aspect-[4/5] md:aspect-video lg:aspect-auto lg:h-full"
                      : cn(natural ? "aspect-[var(--tile-ar)]" : "aspect-[4/5]", "sm:aspect-video lg:aspect-auto lg:h-full")
                    : "aspect-[4/5]",
                )}
                style={natural ? ({ "--tile-ar": `${img.width} / ${img.height}` } as CSSProperties) : undefined}
                aria-label={`${it.type === "clip" ? "Clip abspielen" : "Foto vergrößern"}: ${it.caption}`}
              >
                <Image
                  src={img}
                  alt={it.alt}
                  fill
                  sizes={
                    natural
                      ? "(min-width: 64rem) 640px, 100vw"
                      : coverSizes(
                          row
                            ? featured
                              ? "(min-width: 64rem) 640px, (min-width: 48rem) 100vw, 72vw"
                              : "(min-width: 64rem) 320px, (min-width: 48rem) 31vw, 72vw"
                            : featured
                              ? "(min-width: 64rem) 640px, 100vw"
                              : "(min-width: 64rem) 320px, (min-width: 40rem) 31vw, 48vw",
                          img.width / img.height,
                          4 / 5,
                        )
                  }
                  quality={75}
                  fetchPriority="low"
                  className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                />
                {it.type === "clip" && <TileClip sources={it.sources} />}
                <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end gap-2 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-3 pt-12 pb-3 text-[0.875rem] font-semibold text-white md:px-4 md:pb-4 md:text-[0.9375rem]">
                  {it.type === "clip" && <Play className="mb-0.5 size-4 shrink-0 fill-current" aria-hidden />}
                  {it.caption}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(null);
        }}
        aria-label={current ? current.caption : "Galerie"}
        className="m-0 h-[100dvh] max-h-none w-full max-w-none bg-black/92 p-0 text-white backdrop:bg-black/70 open:grid open:grid-rows-[auto_1fr_auto]"
      >
        {current && (
          <>
            <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <p className="text-[0.9375rem] text-white/70 tabular-nums">
                {(open ?? 0) + 1} / {items.length}
              </p>
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="grid size-11 place-items-center rounded-full transition-[background-color,transform] duration-150 hover:bg-white/12 active:scale-95"
                aria-label="Schließen"
              >
                <X className="size-6" aria-hidden />
              </button>
            </div>
            <div className="relative min-h-0 px-4 sm:px-20">
              {current.type === "image" ? (
                <Image
                  key={open}
                  src={current.image}
                  alt={current.alt}
                  sizes="100vw"
                  quality={85}
                  className="mx-auto h-full w-auto max-w-full rounded-xl object-contain"
                />
              ) : (
                <video key={open} controls autoPlay muted playsInline loop className="mx-auto h-full max-w-full rounded-xl" aria-label={current.alt}>
                  {current.sources.map((s) => (
                    <source key={s.src} src={s.src} type={s.type} />
                  ))}
                </video>
              )}
              <button
                type="button"
                onClick={() => step(-1)}
                className="absolute top-1/2 left-2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur transition-[background-color,transform] duration-150 hover:bg-white/20 active:scale-95 sm:left-5"
                aria-label="Vorheriges"
              >
                <ChevronLeft className="size-6" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                className="absolute top-1/2 right-2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur transition-[background-color,transform] duration-150 hover:bg-white/20 active:scale-95 sm:right-5"
                aria-label="Nächstes"
              >
                <ChevronRight className="size-6" aria-hidden />
              </button>
            </div>
            <div className="px-4 py-4 text-center sm:px-6">
              <p className="font-semibold">{current.caption}</p>
              <p className="mt-0.5 text-[0.8125rem] text-white/60">{current.credit}</p>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
