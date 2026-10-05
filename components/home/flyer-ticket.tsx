import { FlyerWeekText } from "@/components/live/flyer-week";
import { ButtonLink } from "@/components/ui/button";
import { ShareButton } from "@/components/ui/share-button";
import { markt } from "@/content/markt";
import { flyerWeek } from "@/lib/flyer";
import { absoluteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * „Ticket“ mit KW und Gültigkeit des Wochenprospekts. Mit hochgeladenem Prospekt (`cover`) zeigt es dessen Titelseite
 * und führt auf den Viewer unter /angebote; sonst zum offiziellen REWE-Prospekt dieses Markts.
 * Bis 1024 px liegt der rote Abschnitt oben (Perforation waagerecht), danach links (Perforation senkrecht).
 */
export function FlyerTicket({
  headingLevel = "h2",
  className,
  cover,
}: {
  headingLevel?: "h1" | "h2";
  className?: string;
  /** Titelseite des gezeigten Prospekts (aus dem Cockpit) – dann bleiben Knopf und Teilen auf der eigenen Website */
  cover?: { src: string; width: number; height: number };
}) {
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
      {/* Titelseite ab 768 px neben dem Text; bis 1280 px schmaler, damit Überschrift und Knöpfe neben dem roten Teil Platz haben */}
      <div className={cn("p-7 sm:p-10 lg:p-12", cover && "md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-8 lg:p-10 xl:gap-10 xl:p-12")}>
        <div>
          <Heading className={headingLevel === "h1" ? "text-h1" : "text-h2"}>Die Angebote dieser Woche.</Heading>
          <p className="mt-4 text-lede text-muted">
            <span className="font-semibold text-ink">
              <FlyerWeekText initial={week} field="range" />
            </span>{" "}
            · <FlyerWeekText initial={week} field="note" />. Alle Preise und Aktionen deines Marktes stehen im offiziellen REWE-Prospekt.
          </p>
          <div className="cta-row mt-8">
            {cover ? (
              <ButtonLink href="/angebote#prospekt" variant="ink" size="lg">
                Prospekt ansehen
              </ButtonLink>
            ) : (
              <ButtonLink href={markt.links.flyer} external variant="ink" size="lg">
                Prospekt öffnen
              </ButtonLink>
            )}
            <ShareButton
              url={cover ? absoluteUrl("/angebote") : markt.links.flyer}
              title="Prospekt der Woche – REWE Rödelheim"
              text={`Die Angebote bei REWE Rödelheim (KW ${week.kw}):`}
              label="Teilen"
              size="lg"
            />
          </div>
        </div>
        {cover && (
          <a
            href="/angebote#prospekt"
            className="mx-auto mt-8 block w-40 rotate-[2deg] overflow-hidden rounded-xl shadow-[0_20px_50px_rgb(18_18_18/0.25)] ring-1 ring-line transition-transform duration-150 active:scale-[0.97] md:mt-0 md:w-36 xl:w-48"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- fertig skaliertes Vorschaubild */}
            <img src={cover.src} width={cover.width} height={cover.height} alt="Titelseite des aktuellen Prospekts" className="h-auto w-full" />
          </a>
        )}
      </div>
    </div>
  );
}
