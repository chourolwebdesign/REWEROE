"use client";

import type { StaticImageData } from "next/image";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { autoplaySource } from "@/lib/video";

export type StoryMedia =
  | { type: "clip"; src: string; srcSmall: string; poster: StaticImageData; alt: string; caption: string }
  | { type: "image"; image: StaticImageData; alt: string; caption: string; seconds: number; position?: string };

/** Standzeit eines Clips, wenn er nicht laufen darf (Datensparmodus): dann zeigt die Story sein Standbild. */
const STILL_SECONDS = 6;

/**
 * Ablauf der Story: Start nach dem Laden, Pause außer Sicht, Fortschrittsbalken, Blättern. Kein Autoplay bei
 * reduzierter Bewegung. Clips laden erst beim Abspielen – auf Handys in kleiner Auflösung, im Datensparmodus gar nicht.
 */
export function useStory(items: StoryMedia[]) {
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(true);
  const [clipShown, setClipShown] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const elapsed = useRef(0);
  const sources = useRef<Record<number, string | null>>({});
  /** Videoquelle eines Clips (einmal bestimmt); null = nur Standbild. */
  const sourceOf = useCallback(
    (i: number) => {
      const it = items[i];
      if (it.type !== "clip") return null;
      if (!(i in sources.current)) sources.current[i] = autoplaySource(it);
      return sources.current[i];
    },
    [items],
  );

  const playing = ready && !userPaused && inView;

  const go = useCallback(
    (dir: 1 | -1) => {
      elapsed.current = 0;
      setIndex((i) => (i + dir + items.length) % items.length);
    },
    [items.length],
  );

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
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
    };
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
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

  useEffect(() => {
    items.forEach((it, i) => {
      const v = videoRefs.current[i];
      if (!v || it.type !== "clip") return;
      if (i !== index || !playing) {
        v.pause();
        return;
      }
      const src = sourceOf(i);
      if (!src) return;
      if (!v.getAttribute("src")) v.src = src;
      v.play().catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "NotAllowedError") setUserPaused(true);
      });
    });
  }, [index, playing, items, sourceOf]);

  useEffect(() => {
    const v = videoRefs.current[index];
    if (v && items[index].type === "clip") v.currentTime = 0;
    elapsed.current = 0;
  }, [index, items]);

  useEffect(() => {
    barRefs.current.forEach((bar, i) => {
      if (bar && i !== index) bar.style.transform = "scaleX(" + (i < index ? 1 : 0) + ")";
    });
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const step = (t: number) => {
      const current = items[index];
      let p = 0;
      if (current.type === "clip" && sourceOf(index)) {
        const v = videoRefs.current[index];
        p = v && v.duration ? v.currentTime / v.duration : 0;
      } else {
        elapsed.current += (t - last) / 1000;
        p = elapsed.current / (current.type === "clip" ? STILL_SECONDS : current.seconds);
        if (p >= 1) {
          go(1);
          return;
        }
      }
      last = t;
      const bar = barRefs.current[index];
      if (bar) bar.style.transform = "scaleX(" + Math.min(p, 1) + ")";
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, index, items, go, sourceOf]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
    else return;
    e.preventDefault();
  };

  const near = (i: number) => i === index || i === (index + 1) % items.length;

  return { index, item: items[index], go, ready, userPaused, setUserPaused, clipShown, setClipShown, sectionRef, videoRefs, barRefs, onKeyDown, near };
}
