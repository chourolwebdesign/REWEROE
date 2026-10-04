import Image from "next/image";
import { MapPin, Navigation, Phone } from "lucide-react";
import { OpenStatus } from "@/components/live/open-status";
import { ButtonLink } from "@/components/ui/button";
import { markt } from "@/content/markt";
import { berlinNow, formatDayMonth, formatTime, upcomingSpecialDays, weekRows, WEEKDAYS_SHORT } from "@/lib/hours";
import { media } from "@/lib/media";
import { cn } from "@/lib/utils";

/** Öffnungszeiten (mit Live-Status und kommenden Sondertagen) und Anfahrt (statische Karte, keine Drittanbieter). */
export function VisitSection({ className, headingLevel = "h3" }: { className?: string; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  const specials = upcomingSpecialDays(berlinNow(new Date()).date, 45);
  return (
    <div className={cn("grid gap-3 md:gap-4 lg:grid-cols-[0.9fr_1.1fr]", className)}>
      <section aria-labelledby="zeiten-titel" className="reveal flex flex-col rounded-[1.75rem] bg-soft p-6 md:p-9">
        <H id="zeiten-titel" className="text-h3">
          Öffnungszeiten
        </H>
        <OpenStatus tone="light" className="mt-5" />
        <table className="mt-6 w-full text-left">
          <caption className="sr-only">Reguläre Öffnungszeiten</caption>
          <tbody>
            {weekRows().map((r) => (
              <tr key={r.days} className="border-t border-line first:border-t-0">
                <th scope="row" className="py-3.5 pr-4 font-medium">
                  {r.days}
                </th>
                <td className={cn("py-3.5 text-right tabular-nums", r.hours ? "font-semibold" : "text-muted")}>{r.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {specials.length > 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-5">
            <p className="font-semibold">Besondere Tage</p>
            <ul className="mt-2 grid gap-1.5 text-[0.9375rem]">
              {specials.map((d) => (
                <li key={d.date} className="flex justify-between gap-4">
                  <span>
                    {WEEKDAYS_SHORT[d.weekday]} {formatDayMonth(d.date)} · {d.label}
                  </span>
                  <span className="shrink-0 tabular-nums text-muted">
                    {d.hours ? `bis ${formatTime(d.hours[1])}${d.provisional ? "*" : ""}` : "geschlossen"}
                  </span>
                </li>
              ))}
            </ul>
            {specials.some((d) => d.provisional) && (
              <p className="mt-3 text-[0.8125rem] text-muted">* Gesetzlicher Ladenschluss in Hessen; genaue Zeiten geben wir rechtzeitig bekannt.</p>
            )}
          </div>
        ) : (
          <p className="mt-5 text-[0.9375rem] text-muted">An Sonn- und Feiertagen geschlossen.</p>
        )}
        <a
          href={`tel:${markt.phone.e164}`}
          className="mt-8 flex items-center justify-between gap-4 rounded-2xl bg-white p-5 transition-colors hover:bg-soft-2 lg:mt-auto"
        >
          <span>
            <span className="block text-[0.875rem] text-muted">Fragen? Ruf uns an</span>
            <span className="block text-[1.125rem] font-semibold tabular-nums">{markt.phone.display}</span>
          </span>
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-red text-white">
            <Phone className="size-5" aria-hidden />
          </span>
        </a>
      </section>

      <section aria-labelledby="anfahrt-titel" className="reveal overflow-hidden rounded-[1.75rem] bg-soft">
        <div className="relative aspect-[5/3] bg-soft-2">
          <Image src={media.karte.src} alt={media.karte.alt} fill sizes="(min-width: 64rem) 55vw, 100vw" quality={75} className="object-cover" />
          <span className="absolute right-2 bottom-2 rounded-md bg-white/85 px-2 py-0.5 text-[0.6875rem] text-ink-2">© OpenStreetMap-Mitwirkende</span>
        </div>
        <div className="grid gap-5 p-6 md:p-9">
          <div>
            <H id="anfahrt-titel" className="text-h3">
              So findest du uns
            </H>
            <p className="mt-3 flex gap-2.5 text-lede">
              <MapPin className="mt-1 size-5 shrink-0 text-red" aria-hidden />
              <span>
                {markt.address.street}
                <br />
                {markt.address.zip} {markt.address.city}-{markt.address.district}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <ButtonLink href={markt.links.googleMaps} external variant="ink" icon={<Navigation className="size-[1.05em]" aria-hidden />}>
              Route planen
            </ButtonLink>
            <ButtonLink href={markt.links.appleMaps} external variant="white">
              Apple Karten
            </ButtonLink>
            <ButtonLink href={`tel:${markt.phone.e164}`} variant="white" icon={<Phone className="size-[1.05em]" aria-hidden />}>
              {markt.phone.display}
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
