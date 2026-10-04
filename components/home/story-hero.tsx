"use client";

import Image, { type StaticImageData } from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

export type StoryMedia =
  | { type: "clip"; src: string; backdrop: string; posterUrl: string; poster: StaticImageData; alt: string; caption: string }
  | { type: "image"; image: StaticImageData; alt: string; caption: string; seconds: number; position?: string };

const HANDLE = "rewealialamyaar";

/**
 * Erster Screen der Startseite: Clip und Fotos aus dem Markt als Story.
 * Mobil füllt die Story den Bildschirm, der Text liegt unten darüber. Ab `lg` steht sie hochkant gerahmt in der Mitte,
 * dahinter ein stark unscharfes Abbild. Pausierbar (WCAG 2.2.2), Tippen/Pfeiltasten blättern,
 * bei `prefers-reduced-motion` kein Autoplay. Der Clip lädt erst nach dem `load`-Event (LCP ist das Posterbild).
 */
export function StoryHero({ items, intro, side }: { items: StoryMedia[]; intro: ReactNode; side: ReactNode }) {
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(true);
  const [wide, setWide] = useState(false);
  const [clipShown, setClipShown] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const backdropRef = useRef<HTMLVideoElement>(null);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const elapsed = useRef(0);

  const playing = ready && !userPaused && inView;
  const item = items[index];

  const go = useCallback(
    (dir: 1 | -1) => {
      elapsed.current = 0;
      setIndex((i) => (i + dir + items.length) % items.length);
    },
    [items.length],
  );

  // Start erst nach dem Laden der Seite; bei reduzierter Bewegung pausiert beginnen.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const lg = window.matchMedia("(min-width: 64rem)");
    const syncWide = () => setWide(lg.matches);
    syncWide();
    lg.addEventListener("change", syncWide);
    let idle = 0;
    const start = () => {
      idle = window.setTimeout(() => {
        if (reduce.matches) setUserPaused(true);
        setReady(true);
      }, 300);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.clearTimeout(idle);
      window.removeEventListener("load", start);
      lg.removeEventListener("change", syncWide);
    };
  }, []);

  // Außer Sicht oder Tab im Hintergrund → anhalten.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let visible = true;
    const update = () => setInView(visible && !document.hidden);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      update();
    }, { threshold: 0.15 });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  // Clip abspielen/anhalten. Beim Wechsel auf den Clip von vorn beginnen.
  useEffect(() => {
    items.forEach((it, i) => {
      const v = videoRefs.current[i];
      if (!v || it.type !== "clip") return;
      if (i !== index) {
        v.pause();
        return;
      }
      if (!playing) {
        v.pause();
        return;
      }
      if (!v.getAttribute("src")) v.src = it.src;
      // Nur blockiertes Autoplay zählt als Pause; ein unterbrochenes play() (AbortError) nicht.
      v.play().catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "NotAllowedError") setUserPaused(true);
      });
    });
    const b = backdropRef.current;
    if (b) {
      if (playing && wide && item.type === "clip") {
        if (!b.getAttribute("src")) b.src = item.backdrop;
        b.play().catch(() => {});
      } else b.pause();
    }
  }, [index, playing, items, item, wide]);

  useEffect(() => {
    const v = videoRefs.current[index];
    if (v && items[index].type === "clip") v.currentTime = 0;
    elapsed.current = 0;
  }, [index, items]);

  // Fortschrittsbalken (direkt am DOM, kein Re-Render pro Frame) und Weiterschalten bei Fotos.
  useEffect(() => {
    barRefs.current.forEach((bar, i) => {
      if (bar && i !== index) bar.style.transform = `scaleX(${i < index ? 1 : 0})`;
    });
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const step = (t: number) => {
      const current = items[index];
      let p = 0;
      if (current.type === "clip") {
        const v = videoRefs.current[index];
        p = v && v.duration ? v.currentTime / v.duration : 0;
      } else {
        elapsed.current += (t - last) / 1000;
        p = elapsed.current / current.seconds;
        if (p >= 1) {
          go(1);
          return;
        }
      }
      last = t;
      const bar = barRefs.current[index];
      if (bar) bar.style.transform = `scaleX(${Math.min(p, 1)})`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, index, items, go]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
    else return;
    e.preventDefault();
  };

  // Nur das aktuelle und das nächste Element rendern Medien (spart Requests auf Mobil).
  const near = (i: number) => i === index || i === (index + 1) % items.length;

  return (
    <section
      ref={sectionRef}
      aria-roledescription="Story"
      aria-label="Einblicke in den Markt"
      onKeyDown={onKeyDown}
      className="on-dark relative isolate -mt-[4.5rem] min-h-[100svh] overflow-hidden bg-night text-white"
    >
      {/* Unscharfes Abbild hinter der gerahmten Story (nur Desktop) */}
      <div aria-hidden className="absolute inset-0 -z-10 hidden lg:block">
        {items.map((it, i) => (
          <div key={i} className={cn("absolute -inset-[10%] transition-opacity duration-700", i === index ? "opacity-100" : "opacity-0")}>
            {it.type === "clip" ? (
              <video ref={backdropRef} muted playsInline loop preload="none" className="h-full w-full scale-110 object-cover blur-[56px] brightness-[.42] saturate-[1.4]" />
            ) : (
              near(i) && wide && <Image src={it.image} alt="" fill sizes="200px" quality={70} className="scale-110 object-cover blur-[56px] brightness-[.42] saturate-[1.4]" />
            )}
          </div>
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_50%,transparent,rgb(0_0_0/.55))]" />
      </div>

      <div className="wrap grid min-h-[100svh] content-end gap-6 pt-[4.5rem] pb-28 lg:grid-cols-[1fr_auto_1fr] lg:content-center lg:items-center lg:gap-14 lg:pb-12">
        <div className="relative z-10 lg:order-1">{intro}</div>

        {/* Story-Rahmen: mobil vollflächig hinter dem Text, ab lg hochkant in der Mitte */}
        <div className="absolute inset-0 lg:relative lg:inset-auto lg:order-2 lg:flex lg:items-center lg:gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            className="hidden size-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/20 lg:grid"
            aria-label="Vorheriges Bild"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>

          <div className="relative h-full w-full overflow-hidden lg:aspect-[9/16] lg:h-[min(76svh,46rem)] lg:w-auto lg:rounded-[1.875rem] lg:shadow-[var(--shadow-stage)]">
            {items.map((it, i) => (
              <div
                key={i}
                className={cn("absolute inset-0 transition-opacity duration-500", i === index ? "opacity-100" : "pointer-events-none opacity-0")}
                aria-hidden={i !== index}
              >
                {it.type === "clip" ? (
                  <>
                    <Image
                      src={it.poster}
                      alt={it.alt}
                      fill
                      loading={i === 0 ? "eager" : "lazy"}
                      fetchPriority={i === 0 ? "high" : "auto"}
                      sizes="(min-width: 64rem) 430px, 100vw"
                      quality={70}
                      className="object-cover"
                    />
                    <video
                      ref={(el) => {
                        videoRefs.current[i] = el;
                      }}
                      muted
                      playsInline
                      preload="none"
                      onPlaying={() => setClipShown(true)}
                      onEnded={() => go(1)}
                      className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-500", clipShown ? "opacity-100" : "opacity-0")}
                      aria-hidden
                    />
                  </>
                ) : (
                  near(i) && (
                    <Image
                      src={it.image}
                      alt={it.alt}
                      fill
                      loading={i === 0 ? "eager" : "lazy"}
                      fetchPriority={i === 0 ? "high" : "auto"}
                      sizes="(min-width: 64rem) 430px, 100vw"
                      quality={70}
                      className="object-cover"
                      style={{ objectPosition: it.position ?? "50% 50%" }}
                    />
                  )
                )}
              </div>
            ))}

            {/* Lesbarkeit: oben für Kopf/Balken, unten (nur mobil) für den Text */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/55 to-transparent" />
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/90 via-black/45 to-transparent lg:hidden" />

            {/* Tippflächen: links zurück, rechts weiter (liegen unter dem Text) */}
            <div aria-hidden onClick={() => go(-1)} className="absolute inset-y-0 left-0 w-[30%] cursor-w-resize" />
            <div aria-hidden onClick={() => go(1)} className="absolute inset-y-0 right-0 w-[70%] cursor-e-resize" />

            {/* Kopf: Balken, Absender, Pause */}
            <div className="absolute inset-x-3 top-[5.25rem] lg:top-3">
              <div className="flex gap-1" aria-hidden>
                {items.map((_, i) => (
                  <span key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/35">
                    <span
                      ref={(el) => {
                        barRefs.current[i] = el;
                      }}
                      className="block h-full origin-left scale-x-0 rounded-full bg-white"
                    />
                  </span>
                ))}
              </div>
              <div className="mt-2.5 flex items-center gap-2.5 text-[0.875rem]">
                <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-red ring-2 ring-white">
                  <LogoMark height={10} />
                </span>
                <p className="min-w-0 truncate">
                  <span className="font-semibold">{HANDLE}</span>
                  <span className="text-white/75"> · {item.caption}</span>
                </p>
                <button type="button" onClick={() => go(-1)} className="sr-only focus:not-sr-only focus:rounded-full focus:px-3 focus:py-2 lg:hidden">
                  Zurück
                </button>
                <button type="button" onClick={() => go(1)} className="sr-only focus:not-sr-only focus:rounded-full focus:px-3 focus:py-2 lg:hidden">
                  Weiter
                </button>
                <button
                  type="button"
                  onClick={() => setUserPaused((p) => !p)}
                  className="relative z-10 ml-auto grid size-11 shrink-0 place-items-center rounded-full text-white transition hover:bg-white/15"
                  aria-label={userPaused || !ready ? "Story abspielen" : "Story anhalten"}
                  aria-pressed={userPaused}
                >
                  {userPaused ? <Play className="size-5 fill-current" aria-hidden /> : <Pause className="size-5 fill-current" aria-hidden />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => go(1)}
            className="hidden size-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/20 lg:grid"
            aria-label="Nächstes Bild"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>

        <div className="relative z-10 lg:order-3">{side}</div>
      </div>
      <p className="sr-only" aria-live="off">
        Bild {index + 1} von {items.length}: {item.caption}
      </p>
    </section>
  );
}
