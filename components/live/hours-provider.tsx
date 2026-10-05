"use client";

import { createContext, useContext } from "react";
import { markt } from "@/content/markt";
import type { HoursConfig, SpecialDay } from "@/lib/types";

const HoursContext = createContext<HoursConfig>(markt.hours);

/** Sondertage aus dem Cockpit für Live-Anzeigen im Browser („Jetzt geöffnet“); ohne Provider gelten die Zeiten aus dem Code. */
export function HoursProvider({ specialDays, children }: { specialDays: SpecialDay[]; children: React.ReactNode }) {
  return <HoursContext value={{ regular: markt.hours.regular, specialDays }}>{children}</HoursContext>;
}

export const useHoursConfig = () => useContext(HoursContext);
