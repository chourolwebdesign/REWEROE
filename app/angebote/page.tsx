import type { Metadata } from "next";
import { CalendarDays, Info, ShoppingBasket } from "lucide-react";
import { FlyerTicket } from "@/components/home/flyer-ticket";
import { PageHeader } from "@/components/layout/page-header";
import { CalendarSubscribe } from "@/components/live/calendar-subscribe";
import { OpenStatus } from "@/components/live/open-status";
import { ButtonLink } from "@/components/ui/button";
import { InstagramIcon } from "@/components/ui/icons";
import { markt } from "@/content/markt";
import { breadcrumbJsonLd, ldScript } from "@/lib/jsonld";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Angebote & Prospekt der Woche",
  description: "Der aktuelle REWE-Prospekt für den Markt in der Thudichumstraße in Frankfurt-Rödelheim – gültig Montag bis Samstag.",
  alternates: { canonical: "/angebote" },
};

const HINTS = [
  {
    icon: CalendarDays,
    title: "Montag bis Samstag",
    text: "Der Prospekt startet jede Woche neu. Sonntags siehst du hier schon die Angebote der kommenden Woche.",
  },
  {
    icon: ShoppingBasket,
    title: "Solange der Vorrat reicht",
    text: "Aktionsartikel gibt es nur, solange der Vorrat reicht, und nur in haushaltsüblichen Mengen.",
  },
  {
    icon: Info,
    title: "Preise im Prospekt",
    text: "Preise und Aktionen stehen nur im offiziellen REWE-Prospekt – so sind sie immer aktuell.",
  },
] as const;

export default function AngebotePage() {
  return (
    <>
      <PageHeader
        crumbs={[{ href: "/angebote", label: "Angebote" }]}
        eyebrow="Angebote"
        title="Prospekt der Woche."
        lede="Alle Angebote deines REWE in der Thudichumstraße – mit einem Tipp im offiziellen REWE-Prospekt."
      />

      <section aria-label="Aktueller Prospekt" className="wrap">
        <FlyerTicket />
      </section>

      <section id="kalender" aria-labelledby="kalender-titel" className="wrap pt-20 md:pt-28">
        <div className="reveal on-dark relative z-10 grid gap-8 rounded-[2rem] bg-red p-8 text-white md:grid-cols-[1.4fr_1fr] md:items-center md:p-12">
          <div>
            <p className="text-[0.9375rem] font-semibold text-white">Markt-Kalender</p>
            <h2 id="kalender-titel" className="mt-3 text-h2">
              Nie wieder den Prospekt verpassen.
            </h2>
            <p className="mt-4 max-w-[48ch] text-lede text-white">
              Abonniere unseren Kalender: Zum Start jedes Prospekts erinnert dich dein Handy – und an jeden Feiertag, an dem wir geschlossen haben. Ohne App, ohne
              Anmeldung, ohne Newsletter.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <CalendarSubscribe url={absoluteUrl("/kalender.ics")} variant="white" size="lg" align="end" />
            <p className="text-[0.875rem] text-white">Für iPhone, Android, Google und Outlook.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="hinweise-titel" className="wrap pt-20 md:pt-28">
        <h2 id="hinweise-titel" className="text-h2">
          Gut zu wissen.
        </h2>
        <ul className="mt-8 grid gap-3 md:grid-cols-3 md:gap-4">
          {HINTS.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="reveal card-lift flex flex-col rounded-[var(--radius-media)] bg-soft p-6 ring-1 ring-line/60 md:p-8"
            >
              <span className="grid size-14 place-items-center rounded-2xl bg-ink text-white ring-1 ring-inset ring-white/10">
                <Icon className="size-7" strokeWidth={1.7} aria-hidden />
              </span>
              <h3 className="mt-6 text-h3">{title}</h3>
              <p className="mt-2 text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Öffnungszeiten und Instagram" className="wrap py-20 md:py-28">
        <div className="reveal flex flex-col gap-6 rounded-[var(--radius-stage)] bg-ink p-8 text-white md:flex-row md:items-center md:justify-between md:p-12">
          <div>
            <p className="text-eyebrow text-red-bright">Heute einkaufen?</p>
            <h2 className="mt-3 text-h3">Wir sind für dich geöffnet.</h2>
            <OpenStatus tone="dark" className="mt-4" />
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/kontakt" variant="white">
              Anfahrt & Zeiten
            </ButtonLink>
            <ButtonLink href={markt.links.instagram} external variant="glass" icon={<InstagramIcon className="size-[1.1em]" />}>
              Instagram
            </ButtonLink>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(breadcrumbJsonLd([{ name: "Angebote", path: "/angebote" }]))} />
    </>
  );
}
