"use client";

import { useEffect } from "react";

/**
 * Setzt `js` an <html> auch dann, wenn das Inline-Skript im Layout nicht lief: nach einer Client-Navigation von einer Seite ohne
 * Server-HTML (unbekannter Beitrag) oder nach einem Neuaufbau durch React. Davon hängen Einblendungen, die Schnellzugriff-Leiste,
 * das Bewerbungsformular und der Pause-Knopf des Videos ab (`.js-only`, `.js-hidden`).
 */
export function JsClass() {
  useEffect(() => {
    document.documentElement.classList.add("js");
  }, []);
  return null;
}
