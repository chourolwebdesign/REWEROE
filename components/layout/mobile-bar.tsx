"use client";

import { usePathname } from "next/navigation";
import { Navigation, Phone, Tag } from "lucide-react";
import { useEffect, useRef } from "react";
import { markt } from "@/content/markt";

/** Seiten, auf denen die Leiste stören würde: das Bewerbungsformular hat eigene Knöpfe am Seitenende. */
const WITHOUT_BAR = ["/karriere/bewerben"];

/**
 * Feste Aktionsleiste auf dem Handy: die drei häufigsten Gründe, die Seite zu öffnen.
 * Auf der Startseite erscheint sie erst, wenn die gleichen Knöpfe im Hero aus dem Bild sind (CSS in globals.css).
 */
export function MobileBar({ flyer = { href: markt.links.flyer, external: true } }: { flyer?: { href: string; external: boolean } }) {
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const bar = ref.current;
    const hero = document.getElementById("hero-aktionen");
    if (!bar || !hero) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) bar.removeAttribute("data-hero");
      else bar.setAttribute("data-hero", "weg");
    });
    io.observe(hero);
    return () => io.disconnect();
  }, [pathname]);

  if (WITHOUT_BAR.includes(pathname)) return null;

  const item = "flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-[0.9375rem] font-semibold transition-transform duration-150 active:scale-[0.97]";
  return (
    // key: nach jedem Seitenwechsel ein frisches Element ohne alten data-hero-Zustand
    <nav
      key={pathname}
      ref={ref}
      aria-label="Schnellzugriff"
      className="mobile-bar fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-30 flex gap-1.5 rounded-full bg-night/90 p-1.5 text-white shadow-[0_10px_40px_rgb(0_0_0/.35)] ring-1 ring-white/10 backdrop-blur-xl lg:hidden"
    >
      <a href={flyer.href} {...(flyer.external ? { target: "_blank", rel: "noopener" } : {})} className={`${item} bg-red`}>
        <Tag className="size-[1.05em]" aria-hidden />
        Prospekt{flyer.external && <span className="sr-only"> (öffnet in neuem Tab)</span>}
      </a>
      <a href={markt.links.googleMaps} target="_blank" rel="noopener" className={item}>
        <Navigation className="size-[1.05em]" aria-hidden />
        Route<span className="sr-only"> (öffnet Google Maps)</span>
      </a>
      <a href={`tel:${markt.phone.e164}`} className={item}>
        <Phone className="size-[1.05em]" aria-hidden />
        Anrufen
      </a>
    </nav>
  );
}
