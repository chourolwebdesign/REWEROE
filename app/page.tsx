import { CareerBand } from "@/components/home/career-band";
import { FlyerTicket } from "@/components/home/flyer-ticket";
import { Highlights } from "@/components/home/highlights";
import { MarqueeBand } from "@/components/home/marquee-band";
import { NumbersBand } from "@/components/home/numbers-band";
import { RegionalBand } from "@/components/home/regional-band";
import { Services } from "@/components/home/services";
import { hasUpcomingTermine, TermineList } from "@/components/home/termine";
import { StoryHero } from "@/components/home/story-hero";
import { OpenStatus } from "@/components/live/open-status";
import { FlyerWeekText } from "@/components/live/flyer-week";
import { Gallery } from "@/components/media/gallery";
import { PostCard } from "@/components/news/post-card";
import { ButtonLink } from "@/components/ui/button";
import { InstagramIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { VisitSection } from "@/components/visit/visit-section";
import { posts } from "@/content/aktuelles";
import { galerie } from "@/content/galerie";
import { markt } from "@/content/markt";
import { story } from "@/content/story";
import { flyerWeek } from "@/lib/flyer";
import { berlinNow } from "@/lib/hours";
import { absoluteUrl } from "@/lib/site";
import { resolveGallery, resolveStory } from "@/lib/resolve";

export default function HomePage() {
  const week = flyerWeek();
  const latest = posts[0];
  const today = berlinNow(new Date()).date;

  return (
    <>
      <StoryHero
        items={resolveStory(story)}
        intro={
          <>
            <p className="text-eyebrow mb-6 flex items-center gap-2.5 text-white">
              <span aria-hidden className="h-px w-6 shrink-0 bg-white/60" />
              REWE in Frankfurt-Rödelheim
            </p>
            <h1 className="text-hero lg:text-[clamp(4.5rem,1rem+5.6vw,7.5rem)]">
              Willkommen in deinem{" "}
              <span className="rounded-[0.16em] bg-white px-[0.12em] text-red [box-decoration-break:clone]">Markt.</span>
            </h1>
            <p className="mt-7 max-w-[34ch] text-lede text-white">
              Montag bis Samstag von 7 bis 22 Uhr in der Thudichumstraße – mit Bäckerei und Sushi im Markt.
            </p>
          </>
        }
        side={
          <div className="grid gap-5">
            <OpenStatus tone="dark" className="justify-self-start" />
            {/* mobil nebeneinander und kompakter, damit die Story schon im ersten Bildschirm zu sehen ist */}
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              <ButtonLink href={markt.links.flyer} external variant="white" size="lg" className="h-12 px-5 text-base sm:h-14 sm:px-7 sm:text-[1.0625rem]">
                Prospekt KW <FlyerWeekText initial={week} field="kw" />
              </ButtonLink>
              <ButtonLink href={markt.links.googleMaps} external variant="glass" size="lg" className="h-12 px-5 text-base sm:h-14 sm:px-7 sm:text-[1.0625rem]">
                Route
                <span className="hidden sm:inline">&nbsp;planen</span>
              </ButtonLink>
            </div>
            <p className="hidden text-[0.9375rem] text-white sm:block">
              {markt.address.street} · {markt.address.zip} Frankfurt-Rödelheim
            </p>
          </div>
        }
      />

      <MarqueeBand />

      <section aria-label="Prospekt der Woche" className="wrap pt-16 md:pt-24">
        <FlyerTicket />
      </section>

      <NumbersBand className="pt-24 md:pt-32" />

      <RegionalBand className="wrap pt-24 md:pt-32" />

      <section aria-labelledby="markt-titel" className="wrap pt-24 md:pt-32">
        <SectionHeading
          id="markt-titel"
          eyebrow="Aus dem Markt"
          title="Was gerade bei uns los ist."
          lede="Fotos und Clips aus Rödelheim – mehr davon zeigen wir auf Instagram."
          action={
            <ButtonLink href={markt.links.instagram} external variant="ink" icon={<InstagramIcon className="size-[1.1em]" />}>
              @{markt.instagramHandle}
            </ButtonLink>
          }
        />
        <Gallery items={resolveGallery(galerie)} className="mt-10" />
      </section>

      <section aria-labelledby="sortiment-titel" className="wrap pt-24 md:pt-32">
        <SectionHeading
          id="sortiment-titel"
          eyebrow="Bei uns im Markt"
          title="Regional, Bio und frisch gebacken."
          action={
            <ButtonLink href="/markt" variant="soft">
              Unser Markt
            </ButtonLink>
          }
        />
        <Highlights className="mt-10" />
      </section>

      <section aria-labelledby="praktisch-titel" className="wrap pt-24 md:pt-32">
        <SectionHeading
          id="praktisch-titel"
          eyebrow="Praktisch"
          title="Mehr als einkaufen."
          lede="Kleine Helfer für den Alltag – ohne Anmeldung, ohne Werbung, ohne Datensammeln."
        />
        <Services calendarUrl={absoluteUrl("/kalender.ics")} className="mt-10" />
      </section>

      {hasUpcomingTermine(today) && (
        <section aria-labelledby="termine-titel" className="wrap pt-24 md:pt-32">
          <SectionHeading id="termine-titel" eyebrow="Termine" title="Demnächst im Markt." />
          <div className="mt-10">
            <TermineList today={today} />
          </div>
        </section>
      )}

      {latest && (
        <section aria-labelledby="aktuelles-titel" className="wrap pt-24 md:pt-32">
          <SectionHeading
            id="aktuelles-titel"
            eyebrow="Aktuelles"
            title="Neues aus Rödelheim."
            action={
              <ButtonLink href="/aktuelles" variant="soft">
                Alle Beiträge
              </ButtonLink>
            }
          />
          <div className="mt-10">
            <PostCard post={latest} wide />
          </div>
        </section>
      )}

      <section aria-labelledby="besuch-titel" className="wrap pt-24 md:pt-32">
        <SectionHeading id="besuch-titel" eyebrow="Besuch" title="Öffnungszeiten & Anfahrt." />
        <VisitSection className="mt-10" />
      </section>

      <section aria-label="Karriere" className="wrap py-24 md:py-32">
        <CareerBand />
      </section>
    </>
  );
}
