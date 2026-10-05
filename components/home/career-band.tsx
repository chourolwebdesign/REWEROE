import { ButtonLink } from "@/components/ui/button";

/** Karriere-Hinweis. Keine erfundenen Stellen: verweist auf /karriere und die REWE-Stellensuche. */
export function CareerBand() {
  return (
    <div className="reveal on-dark relative overflow-hidden rounded-[2rem] bg-night px-6 py-12 text-white md:px-14 md:py-16">
      <div aria-hidden className="absolute -top-24 -right-24 size-80 rounded-full bg-red/35 blur-3xl" />
      <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div>
          <p className="text-eyebrow text-red-bright">Karriere</p>
          <h2 className="mt-3 text-h2">Arbeiten im Supermarkt um die Ecke.</h2>
          <p className="mt-4 max-w-[48ch] text-lede text-white/75">
            Kasse, Frische, Ware oder Ausbildung: wie du bei uns einsteigen kannst – und wo du aktuelle Stellen von REWE in deiner Nähe findest.
          </p>
        </div>
        <div className="cta-row lg:justify-end">
          <ButtonLink href="/karriere/bewerben" variant="white" size="lg">
            In 60 Sekunden bewerben
          </ButtonLink>
          <ButtonLink href="/karriere" variant="glass" size="lg">
            Mehr erfahren
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
