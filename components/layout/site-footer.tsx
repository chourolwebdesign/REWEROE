import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { InstallApp } from "@/components/pwa/install-app";
import { InstagramIcon } from "@/components/ui/icons";
import { markt } from "@/content/markt";
import { weekRows } from "@/lib/hours";
import { NAV } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="on-dark bg-night pb-28 text-white lg:pb-0">
      {/* vier Spalten erst ab 1280 px – darunter wird die Adresse sonst mitten in „18–22“ umbrochen. Handy: Logo und Instagram in
          einer Zeile, „Besuch“ über die volle Breite, darunter Service und Rechtliches nebeneinander; die Seitenliste steht im Menü. */}
      <div className="wrap grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-8 py-10 md:grid-cols-2 md:gap-12 md:py-16 lg:grid-cols-3 lg:py-24 xl:grid-cols-[1.4fr_1fr_0.85fr_1fr] xl:gap-14">
        <div className="col-span-2 flex flex-wrap items-center justify-between gap-4 md:grid md:content-start md:justify-normal md:gap-6 lg:col-span-3 xl:col-span-1">
          <Logo tone="light" height={38} />
          <p className="max-w-[38ch] text-lede text-white/70 max-md:hidden">
            Dein REWE in Frankfurt-Rödelheim – ein selbstständig geführter Markt der {markt.legalName}.
          </p>
          <a
            href={markt.links.instagram}
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-11 w-fit items-center gap-2.5 rounded-full bg-white/10 px-5 font-semibold ring-1 ring-inset ring-white/15 transition-[background-color,transform] duration-150 hover:bg-white/16 active:scale-[0.97]"
          >
            <InstagramIcon className="size-5" />@{markt.instagramHandle}
            <span className="sr-only"> auf Instagram (öffnet in neuem Tab)</span>
          </a>
        </div>

        <div className="col-span-2 md:col-span-1">
          <h2 className="text-eyebrow text-white/60">Besuch</h2>
          <address className="mt-5 not-italic leading-relaxed">
            <span className="whitespace-nowrap">{markt.address.street}</span>
            <br />
            {markt.address.zip} {markt.address.city}
          </address>
          <a href={`tel:${markt.phone.e164}`} className="mt-4 inline-flex min-h-11 items-center font-semibold underline-offset-4 hover:underline">
            {markt.phone.display}
          </a>
          <dl className="mt-5 grid gap-1.5">
            {weekRows().map((r) => (
              <div key={r.days} className="flex justify-between gap-6">
                <dt className="text-white/70">{r.daysShort}</dt>
                <dd className="tabular-nums">{r.time}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[0.875rem] text-white/50">An Feiertagen geschlossen.</p>
        </div>

        <div className="max-md:order-last">
          <h2 className="text-eyebrow text-white/60 max-md:hidden">Seiten</h2>
          <ul className="mt-4 grid max-md:hidden">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-11 items-center text-white/85 hover:text-white hover:underline hover:underline-offset-4">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {/* Handy: auf Höhe der Service-Links (Überschrift + Abstand) */}
          <ul className="grid gap-1 max-md:pt-9 md:mt-4 md:border-t md:border-white/10 md:pt-4">
            <li>
              <Link href="/impressum" className="inline-flex min-h-10 items-center text-white/70 hover:text-white hover:underline">
                Impressum
              </Link>
            </li>
            <li>
              <Link href="/datenschutz" className="inline-flex min-h-10 items-center text-white/70 hover:text-white hover:underline">
                Datenschutz
              </Link>
            </li>
          </ul>
        </div>

        <nav aria-label="Service">
          <h2 className="text-eyebrow text-white/60">Service</h2>
          <ul className="mt-4 grid">
            {[
              { href: "/karriere/bewerben", label: "Bewerben in 60 Sekunden" },
              { href: "/angebote#kalender", label: "Markt-Kalender abonnieren" },
              { href: "/feedback", label: "Feedback zum Einkauf" },
            ].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-11 items-center text-white/85 hover:text-white hover:underline hover:underline-offset-4">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <InstallApp variant="glass" size="sm" className="mt-4" />
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-2 py-5 text-[0.875rem] text-white/55 sm:flex-row sm:items-center sm:justify-between md:py-7">
          <p>
            © {year} {markt.legalName}
          </p>
          <p>Frankfurt-Rödelheim · Thudichumstraße 18–22</p>
        </div>
      </div>
    </footer>
  );
}
