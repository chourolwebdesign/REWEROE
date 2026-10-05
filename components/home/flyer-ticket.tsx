import { FlyerWeekText } from "@/components/live/flyer-week";
import { ButtonLink } from "@/components/ui/button";
import { ShareButton } from "@/components/ui/share-button";
import { markt } from "@/content/markt";
import { flyerWeek } from "@/lib/flyer";
import { cn } from "@/lib/utils";

/**
 * „Ticket“ mit KW und Gültigkeit des Wochenprospekts. Führt immer zum offiziellen REWE-Prospekt dieses Markts –
 * Preise und Angebote stehen bewusst nicht auf dieser Website (eine Quelle, nie veraltet).
 * Bis 1024 px liegt der rote Abschnitt oben (Perforation waagerecht), danach links (Perforation senkrecht).
 */
export function FlyerTicket({ headingLevel = "h2", className }: { headingLevel?: "h1" | "h2"; className?: string }) {
  const week = flyerWeek();
  const Heading = headingLevel;
  return (
    <div className={cn("grid overflow-hidden rounded-[2rem] bg-white shadow-[var(--shadow-lift)] lg:grid-cols-[minmax(15rem,20rem)_1fr]", className)}>
      <div className="relative bg-red p-7 text-white sm:px-10 lg:p-10">
        <p className="flex h-full items-end justify-between gap-4 lg:flex-col lg:items-start">
          <span className="text-eyebrow text-white">
            Prospekt · <abbr title="Kalenderwoche" className="no-underline">KW</abbr>
          </span>
          <span className="font-display text-[5.5rem] leading-[0.8] font-extrabold tracking-[-0.05em] tabular-nums sm:text-[7rem] lg:text-[9rem]">
            <FlyerWeekText initial={week} field="kw" />
          </span>
        </p>
        {/* Perforation zwischen den Ticket-Hälften */}
        <span
          aria-hidden
          className="absolute inset-x-7 -bottom-px h-0.5 bg-[repeating-linear-gradient(90deg,#fff_0_10px,transparent_10px_20px)] opacity-70 sm:inset-x-10 lg:hidden"
        />
        <span
          aria-hidden
          className="absolute top-5 -right-px bottom-5 hidden w-0.5 bg-[repeating-linear-gradient(#fff_0_10px,transparent_10px_20px)] opacity-70 lg:block"
        />
      </div>
      <div className="p-7 sm:p-10 lg:p-12">
        <Heading className={headingLevel === "h1" ? "text-h1" : "text-h2"}>Die Angebote dieser Woche.</Heading>
        <p className="mt-4 text-lede text-muted">
          <span className="font-semibold text-ink">
            <FlyerWeekText initial={week} field="range" />
          </span>{" "}
          · <FlyerWeekText initial={week} field="note" />. Alle Preise und Aktionen deines Marktes stehen im offiziellen REWE-Prospekt.
        </p>
        <div className="cta-row mt-8">
          <ButtonLink href={markt.links.flyer} external variant="ink" size="lg">
            Prospekt öffnen
          </ButtonLink>
          <ShareButton
            url={markt.links.flyer}
            title="Prospekt der Woche – REWE Rödelheim"
            text={`Die Angebote bei REWE Rödelheim (KW ${week.kw}):`}
            label="Teilen"
            size="lg"
          />
        </div>
      </div>
    </div>
  );
}
