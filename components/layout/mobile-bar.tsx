import { Navigation, Phone, Tag } from "lucide-react";
import { markt } from "@/content/markt";

/** Feste Aktionsleiste auf dem Handy: die drei häufigsten Gründe, die Seite zu öffnen. */
export function MobileBar() {
  const item = "flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-[0.9375rem] font-semibold";
  return (
    <nav
      aria-label="Schnellzugriff"
      className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-30 flex gap-1.5 rounded-full bg-night/90 p-1.5 text-white shadow-[0_10px_40px_rgb(0_0_0/.35)] ring-1 ring-white/10 backdrop-blur-xl lg:hidden"
    >
      <a href={markt.links.flyer} target="_blank" rel="noopener" className={`${item} bg-red`}>
        <Tag className="size-[1.05em]" aria-hidden />
        Prospekt<span className="sr-only"> (öffnet in neuem Tab)</span>
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
