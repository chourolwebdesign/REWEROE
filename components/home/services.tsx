import { BriefcaseBusiness, CalendarHeart, Smartphone } from "lucide-react";
import { CalendarSubscribe } from "@/components/live/calendar-subscribe";
import { InstallApp } from "@/components/pwa/install-app";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** „Praktisch“: Werkzeuge, die keine andere Kaufmannsseite bietet – ohne Anmeldung, ohne Tracking. */
export function Services({ calendarUrl, className }: { calendarUrl: string; className?: string }) {
  // Handy: waagerechte Reihe (snap-row), jede Karte 84 % breit
  const card = "reveal flex flex-col gap-5 rounded-[1.75rem] p-6 max-md:w-[84%] max-md:shrink-0 max-md:snap-start md:p-7";
  const icon = "grid size-12 place-items-center rounded-2xl";
  return (
    // Handy: Reihe zum Wischen ohne die Bewerben-Karte (die Karriere-Band folgt weiter unten); Tablet: zwei Karten nebeneinander,
    // die dritte darunter in voller Breite; ab 1024 px drei Spalten
    <ul data-snap-row className={cn("max-md:snap-row md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-3", className)}>
      <li className={cn(card, "on-dark relative z-10 bg-red text-white")}>
        <span className={cn(icon, "bg-white/15")}>
          <CalendarHeart className="size-6" aria-hidden />
        </span>
        <div>
          <h3 className="text-h3">Prospekt im Kalender</h3>
          <p className="mt-2 text-white">Jeden Montag eine Erinnerung an den neuen Prospekt – und alle Feiertage. Ohne App, ohne Anmeldung.</p>
        </div>
        <CalendarSubscribe url={calendarUrl} variant="white" className="mt-auto" />
      </li>
      <li className={cn(card, "on-dark bg-ink text-white")}>
        <span className={cn(icon, "bg-white/10")}>
          <Smartphone className="size-6 text-red-bright" aria-hidden />
        </span>
        <div>
          <h3 className="text-h3">Als App aufs Handy</h3>
          <p className="mt-2 text-white/75">
            REWE Rödelheim auf dem Home-Bildschirm – Öffnungszeiten und Adresse auch ohne Netz. Oder im Browser-Menü „Zum Startbildschirm“ wählen.
          </p>
        </div>
        <InstallApp variant="white" className="mt-auto self-start" label="App installieren" />
      </li>
      <li className={cn(card, "bg-soft max-md:hidden md:col-span-2 lg:col-span-1")}>
        <span className={cn(icon, "bg-white")}>
          <BriefcaseBusiness className="size-6 text-red" aria-hidden />
        </span>
        <div>
          <h3 className="text-h3">Bewerben in 60 Sekunden</h3>
          <p className="mt-2 text-muted">Kein Anschreiben, Lebenslauf optional – sag uns einfach, was du machen möchtest.</p>
        </div>
        <ButtonLink href="/karriere/bewerben" variant="red" className="mt-auto self-start">
          Jetzt bewerben
        </ButtonLink>
      </li>
    </ul>
  );
}
