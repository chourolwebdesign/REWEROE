"use client";

import { useSyncExternalStore } from "react";

/**
 * Aktuelle Uhrzeit für Live-Anzeigen, auf 30 s gerundet. Auf dem Server und während der Hydration `null`
 * (die Seite zeigt dann ihren statischen Text), danach die echte Zeit – ohne Hydration-Fehler.
 */
const STEP = 30_000;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let current = 0;

const round = () => Math.floor(Date.now() / STEP) * STEP;

function tick() {
  const next = round();
  if (next !== current) {
    current = next;
    listeners.forEach((l) => l());
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    tick();
    timer = setInterval(tick, 5_000);
    document.addEventListener("visibilitychange", tick);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = null;
      document.removeEventListener("visibilitychange", tick);
    }
  };
}

const getSnapshot = () => current || (current = round());
const getServerSnapshot = () => 0;

export function useNow(): Date | null {
  const t = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return t ? new Date(t) : null;
}
