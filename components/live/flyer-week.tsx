"use client";

import { flyerWeek, type FlyerWeek } from "@/lib/flyer";
import { useNow } from "@/lib/use-now";

/**
 * KW, Zeitraum oder Hinweis der Prospektwoche. Der Server rendert `initial` (Seite wird stündlich neu gebaut),
 * im Browser wird mit der echten Uhrzeit nachgerechnet – auch eine zwischengespeicherte Seite zeigt so nie die Vorwoche.
 */
export function FlyerWeekText({ initial, field }: { initial: FlyerWeek; field: "kw" | "range" | "note" }) {
  const now = useNow();
  const week = now ? flyerWeek(now) : initial;
  return <>{week[field]}</>;
}
