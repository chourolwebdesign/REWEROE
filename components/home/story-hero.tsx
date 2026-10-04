"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/brand/logo";
import { useStory, type StoryMedia } from "@/components/home/use-story";
import { cn } from "@/lib/utils";

export type { StoryMedia };

const HANDLE = "rewealialamyaar";
const NAV_BTN = "grid size-11 place-items-center rounded-full bg-white/12 text-white ring-1 ring-white/25 transition hover:bg-white/22";
const IMG_SIZES = "(min-width: 64rem) 430px, 90vw";

/** Roter Hero: große Headline links, Story (Clip + Fotos) im Hochkant-Rahmen rechts. */
export function StoryHero({ items, intro, side }: { items: StoryMedia[]; intro: ReactNode; side: ReactNode }) {
  const { index, item, go, ready, userPaused, setUserPaused, clipShown, setClipShown, sectionRef, videoRefs, barRefs, onKeyDown, near } = useStory(items);

  return (
    <section
      ref={sectionRef}
      aria-roledescription="Story"
      aria-label="Einblicke in den Markt"
      onKeyDown={onKeyDown}
      className="on-dark relative isolate -mt-[4.5rem] overflow-hidden bg-red text-white"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-48 -left-48 size-[38rem] rounded-full bg-red-bright/35 blur-[120px]" />
        <div className="absolute -right-40 -bottom-56 size-[44rem] rounded-full bg-red-deep blur-[120px]" />
        <p className="absolute inset-x-0 -bottom-[0.2em] font-display text-[24vw] leading-none font-extrabold tracking-[-0.06em] whitespace-nowrap text-white/[0.07] select-none lg:text-[19vw]">
          Rödelheim
        </p>
      </div>

      <div className="wrap relative grid gap-12 pt-28 pb-16 md:pt-32 lg:min-h-[100svh] lg:grid-cols-[minmax(0,1.1fr)_auto] lg:items-center lg:gap-20 lg:pt-[6.5rem] lg:pb-16">
        <div className="relative z-10 grid gap-9 lg:gap-12">
          <div>{intro}</div>
          <div>{side}</div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[25rem] sm:max-w-[27rem] lg:mx-0 lg:w-auto lg:max-w-none">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] bg-night shadow-[0_40px_100px_rgb(60_0_8/0.55)] ring-1 ring-white/25 sm:aspect-[9/14] lg:aspect-[9/16] lg:h-[min(78svh,46rem)] lg:w-auto lg:rotate-[1.5deg]">
            {items.map((it, i) => (
              <div
                key={i}
                className={cn("absolute inset-0 transition-opacity duration-500", i === index ? "opacity-100" : "pointer-events-none opacity-0")}
                aria-hidden={i !== index}
              >
                {it.type === "clip" ? (
                  <>
                    <Image src={it.poster} alt={it.alt} fill loading={i === 0 ? "eager" : "lazy"} fetchPriority={i === 0 ? "high" : "auto"} sizes={IMG_SIZES} quality={70} className="object-cover" />
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
                    <Image src={it.image} alt={it.alt} fill loading={i === 0 ? "eager" : "lazy"} fetchPriority={i === 0 ? "high" : "auto"} sizes={IMG_SIZES} quality={70} className="object-cover" style={{ objectPosition: it.position ?? "50% 50%" }} />
                  )
                )}
              </div>
            ))}

            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/60 to-transparent" />
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/50 to-transparent" />
            <div aria-hidden onClick={() => go(-1)} className="absolute inset-y-0 left-0 w-[30%] cursor-w-resize" />
            <div aria-hidden onClick={() => go(1)} className="absolute inset-y-0 right-0 w-[70%] cursor-e-resize" />

            <div className="absolute inset-x-3 top-3">
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
                <button type="button" onClick={() => go(-1)} className="sr-only focus:not-sr-only focus:rounded-full focus:px-3 focus:py-2">
                  Zurück
                </button>
                <button type="button" onClick={() => go(1)} className="sr-only focus:not-sr-only focus:rounded-full focus:px-3 focus:py-2">
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

          <div className="mt-6 hidden items-center justify-center gap-4 lg:flex">
            <button type="button" onClick={() => go(-1)} className={NAV_BTN} aria-label="Vorheriges Bild">
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <p className="min-w-[4.5rem] text-center text-[0.9375rem] font-semibold tabular-nums text-white" aria-hidden>
              {index + 1} / {items.length}
            </p>
            <button type="button" onClick={() => go(1)} className={NAV_BTN} aria-label="Nächstes Bild">
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      </div>
      <p className="sr-only" aria-live="off">
        Bild {index + 1} von {items.length}: {item.caption}
      </p>
    </section>
  );
}
