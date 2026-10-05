import type { Metadata } from "next";
import { Phone, WifiOff } from "lucide-react";
import { markt } from "@/content/markt";
import { weekRows } from "@/lib/hours";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

/** Wird vom Service Worker gezeigt, wenn keine Verbindung besteht und die Seite noch nicht gespeichert war. */
export default function OfflinePage() {
  return (
    <div className="wrap grid min-h-[70svh] content-center gap-8 py-16">
      <div>
        <span className="grid size-14 place-items-center rounded-2xl bg-soft">
          <WifiOff className="size-7 text-red" aria-hidden />
        </span>
        <h1 className="mt-6 text-h1">Gerade kein Netz.</h1>
        <p className="mt-4 max-w-[46ch] text-lede text-muted">
          Seiten, die du schon geöffnet hast, funktionieren trotzdem. Das Wichtigste haben wir dir hier hingelegt:
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 md:gap-4">
        <section aria-labelledby="off-zeiten" className="rounded-[1.75rem] bg-soft p-6 md:p-8">
          <h2 id="off-zeiten" className="text-h3">
            Öffnungszeiten
          </h2>
          <dl className="mt-4 grid gap-2">
            {weekRows().map((r) => (
              <div key={r.days} className="flex justify-between gap-4 border-t border-line pt-2 first:border-t-0 first:pt-0">
                <dt>{r.days}</dt>
                <dd className="font-semibold tabular-nums">{r.time}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[0.9375rem] text-muted">An Feiertagen geschlossen.</p>
        </section>
        <section aria-labelledby="off-adresse" className="rounded-[1.75rem] bg-soft p-6 md:p-8">
          <h2 id="off-adresse" className="text-h3">
            Adresse & Telefon
          </h2>
          <p className="mt-4 text-lede">
            {markt.address.street}
            <br />
            {markt.address.zip} {markt.address.city}
          </p>
          <a href={`tel:${markt.phone.e164}`} className="mt-5 inline-flex h-13 items-center gap-2.5 rounded-full bg-red px-6 font-semibold text-white">
            <Phone className="size-[1.05em]" aria-hidden />
            {markt.phone.display}
          </a>
        </section>
      </div>
    </div>
  );
}
