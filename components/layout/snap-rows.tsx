"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Wisch-Reihen (`data-snap-row`): Der Tastaturfokus scrollt das fokussierte Element ganz ins Bild – Chrome lässt halb sichtbare
 * fokussierte Elemente in waagerechten Scrollern sonst stehen. Reihen ohne eigene Links (`data-snap-region="Name"`) werden nur dann
 * fokussierbare, benannte Bereiche, wenn sie wirklich waagerecht scrollen (Handy: Pfeiltasten scrollen, axe
 * „scrollable-region-focusable“); auf dem Desktop sind sie ein Raster ohne zusätzlichen Tab-Stopp. Läuft nach jeder Navigation neu.
 */
export function SnapRows() {
  const pathname = usePathname();
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onFocus = (e: FocusEvent) => {
      const el = e.target instanceof Element ? e.target : null;
      const row = el?.closest<HTMLElement>("[data-snap-row]");
      if (!el || !row || el === row || row.scrollWidth <= row.clientWidth) return;
      (el.closest("li, article") ?? el).scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduce.matches ? "auto" : "smooth" });
    };
    const regions = () => {
      for (const row of document.querySelectorAll<HTMLElement>("[data-snap-region]")) {
        if (row.scrollWidth > row.clientWidth) {
          row.tabIndex = 0;
          row.setAttribute("role", "region");
          row.setAttribute("aria-label", row.dataset.snapRegion ?? "");
        } else {
          row.removeAttribute("tabindex");
          row.removeAttribute("role");
          row.removeAttribute("aria-label");
        }
      }
    };
    regions();
    document.addEventListener("focusin", onFocus);
    window.addEventListener("resize", regions);
    return () => {
      document.removeEventListener("focusin", onFocus);
      window.removeEventListener("resize", regions);
    };
  }, [pathname]);
  return null;
}
