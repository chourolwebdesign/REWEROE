"use client";
import { useEffect, useState, useSyncExternalStore } from "react";

const noop = () => () => {};
/** True after hydration, false during SSR — without a setState-in-effect. */
export function useMounted() {
  return useSyncExternalStore(noop, () => true, () => false);
}

/** Re-renders every `ms` milliseconds; returns a counter you can ignore. */
export function useTick(ms: number) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
  return tick;
}

/** Reads a JSON value from web storage after mount (never during SSR). */
export function useStoredJson<T>(storage: "local" | "session", key: string): T | null {
  const mounted = useMounted();
  if (!mounted) return null;
  try {
    const raw = (storage === "local" ? localStorage : sessionStorage).getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
