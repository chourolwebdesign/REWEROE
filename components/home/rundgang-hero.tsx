"use client";

import Image, { type StaticImageData } from "next/image";
import { Pause, Play } from "lucide-react";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/brand/logo";
import { useHeroClip } from "@/components/home/use-hero-clip";
import type { VideoSource } from "@/lib/video";
import { cn } from "@/lib/utils";

export type HeroClip = { sources: readonly VideoSource[]; poster: StaticImageData; alt: string; caption: string };

const HANDLE = "rewealialamyaar";
/**
 * Poster-Breite: auf dem Handy randlos – ein 9:16-Bild füllt einen schmaleren Bildschirm über die Höhe (56,25vh breit), sonst über
 * die Breite; auf dem Desktop der Rahmen rechts (höchstens 52rem hoch → gut 29rem breit).
 */
const POSTER_SIZES = "(min-width: 64rem) 30rem, (max-aspect-ratio: 9/16) 56.25vh, 100vw";

/**
 * Hero der Startseite: der Rundgang durch den Markt in Schleife. Desktop-Rahmen: Bildschirmhöhe minus Kopfleiste und Abstände
 * (bei 900 px gut 87 %), höchstens 52rem – so liegt er ganz im ersten Bildschirm. Handy und Tablet: das Video füllt den ersten Bildschirm randlos
 * hinter der transparenten Kopfleiste, Text und Knöpfe liegen unten auf einem dunklen Verlauf. Desktop: roter Grund, Text links,
 * großer Hochkant-Rahmen rechts.
 */
export function RundgangHero({ clip, intro, side }: { clip: HeroClip; intro: ReactNode; side: ReactNode }) {
  const { rootRef, videoRef, paused, toggle, shown, onPlaying } = useHeroClip(clip.sources);

  return (
    <section ref={rootRef} data-hero aria-labelledby="hero-titel" className="on-dark relative isolate -mt-[4.5rem] overflow-hidden bg-night text-white lg:bg-red">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden lg:block">
        <div className="absolute -top-48 -left-48 size-[38rem] rounded-full bg-red-bright/35 blur-[120px]" />
        <div className="absolute -right-40 -bottom-56 size-[44rem] rounded-full bg-red-deep blur-[120px]" />
        <p className="absolute inset-x-0 -bottom-[0.2em] font-display text-[19vw] leading-none font-extrabold tracking-[-0.06em] whitespace-nowrap text-white/[0.07] select-none">
          Rödelheim
        </p>
      </div>

      {/* Unter 1024 px ist der Abschnitt der Bezugsrahmen des Videos (randlos, z-0 – mit negativem z-index läge der Grid-Container
          darüber und finge die Klicks auf den Pause-Knopf ab), darüber die rechte Spalte. */}
      <div className="wrap grid min-h-[100svh] lg:relative lg:grid-cols-[minmax(0,1.1fr)_auto] lg:items-center lg:gap-20 lg:pt-[5.5rem] lg:pb-6">
        {/* unten ausgerichtet statt gestreckt – sonst läge der Textblock über dem Pause-Knopf oben im Video */}
        <div className="relative z-10 grid gap-6 self-end pt-28 pb-8 sm:pb-12 lg:gap-12 lg:self-center lg:p-0">
          <div>{intro}</div>
          <div>{side}</div>
        </div>

        <div
          data-hero-video
          className="absolute inset-0 z-0 bg-night lg:relative lg:inset-auto lg:z-10 lg:aspect-[9/16] lg:h-[min(calc(100svh-7rem),52rem)] lg:overflow-hidden lg:rounded-[1.75rem] lg:shadow-[0_40px_100px_rgb(60_0_8/0.55)] lg:ring-1 lg:ring-white/25 lg:rotate-[1.5deg]"
        >
          {/* sofort laden, aber ohne fetchPriority="high": auf dem Handy füllt das Poster den Bildschirm und zählt für den LCP als
              Hintergrund – LCP ist die Überschrift, die auf die Titelschrift wartet; ein vorgezogenes Poster nahm ihr die Leitung
              (Lighthouse lokal / 90 → 93, LCP 3,6 → 3,2 s). Bilder im sichtbaren Bereich stuft Chrome nach dem Layout selbst hoch. */}
          <Image src={clip.poster} alt={clip.alt} fill loading="eager" sizes={POSTER_SIZES} quality={85} className="object-cover" />
          <video
            ref={videoRef}
            loop
            muted
            playsInline
            preload="none"
            onPlaying={onPlaying}
            aria-hidden
            className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-500", shown ? "opacity-100" : "opacity-0")}
          />
          {/* Handy: oben für die Kopfleiste, unten für Text und Knöpfe; Desktop: dezent für die Instagram-Zeile */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/55 to-transparent lg:h-36 lg:from-black/60" />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-black/90 via-black/55 to-transparent lg:h-28 lg:from-black/50 lg:via-transparent" />

          <div className="absolute top-[5.25rem] right-4 flex items-center gap-2.5 text-[0.875rem] sm:right-6 lg:inset-x-3 lg:top-3">
            <span className="hidden size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-red ring-2 ring-white lg:grid">
              <LogoMark height={10} />
            </span>
            <p className="hidden min-w-0 truncate lg:block">
              <span className="font-semibold">{HANDLE}</span>
              <span className="text-white/75"> · {clip.caption}</span>
            </p>
            <button
              type="button"
              onClick={toggle}
              className="relative z-10 grid size-11 shrink-0 place-items-center rounded-full bg-black/35 text-white ring-1 ring-white/25 backdrop-blur-sm transition-[background-color,transform] duration-150 hover:bg-white/15 active:scale-95 lg:ml-auto lg:bg-transparent lg:ring-0 lg:backdrop-blur-none"
              aria-label={paused ? "Rundgang abspielen" : "Rundgang anhalten"}
              aria-pressed={paused}
            >
              {paused ? <Play className="size-5 fill-current" aria-hidden /> : <Pause className="size-5 fill-current" aria-hidden />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
