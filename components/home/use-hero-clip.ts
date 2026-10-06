"use client";

import { useEffect, useRef, useState } from "react";
import { autoplaySource, pickSource, type VideoSource } from "@/lib/video";

/**
 * Ein Clip in Schleife (Hero der Startseite): startet nach dem Laden der Seite im Leerlauf und pausiert außer Sicht oder im
 * Hintergrund-Tab. Bei reduzierter Bewegung und im Datensparmodus startet er nicht von selbst – der Knopf startet ihn dann in der
 * besten Fassung, die der Browser abspielen kann.
 */
export function useHeroClip(sources: readonly VideoSource[]) {
  const [ready, setReady] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [shown, setShown] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  /** Fassung für den automatischen Start; null = nur auf Knopfdruck (Datensparmodus). */
  const autoSrc = useRef<string | null>(null);
  /** Wer vor dem Start schon gedrückt hat, behält seine Wahl (auch bei reduzierter Bewegung). */
  const chosen = useRef(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let idle = 0;
    const start = () => {
      idle = window.setTimeout(() => {
        autoSrc.current = autoplaySource(sources);
        if (!chosen.current && (reduce.matches || !autoSrc.current)) setUserPaused(true);
        setReady(true);
      }, 300);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.clearTimeout(idle);
      window.removeEventListener("load", start);
    };
  }, [sources]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let visible = true;
    const update = () => setInView(visible && !document.hidden);
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        update();
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  const playing = ready && !userPaused && inView;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (!playing) {
      v.pause();
      return;
    }
    if (!v.getAttribute("src")) {
      const src = autoSrc.current ?? pickSource(sources, (type) => v.canPlayType(type));
      if (!src) {
        setUserPaused(true);
        return;
      }
      v.src = src;
    }
    v.play().catch((e: unknown) => {
      if (e instanceof DOMException && e.name === "NotAllowedError") setUserPaused(true);
    });
  }, [playing, sources]);

  /** Knopf zeigt „abspielen“, solange der Clip nicht läuft oder laufen soll (vor dem Start oder angehalten). */
  const paused = userPaused || !ready;

  return {
    rootRef,
    videoRef,
    paused,
    toggle: () => {
      chosen.current = true;
      setUserPaused(!paused);
    },
    shown,
    onPlaying: () => setShown(true),
  };
}
