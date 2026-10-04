import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { InstagramIcon } from "@/components/ui/icons";
import { markt } from "@/content/markt";
import { weekRows } from "@/lib/hours";
import { NAV } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="on-dark bg-night pb-28 text-white lg:pb-0">
      <div className="wrap grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap=20 lg:py-24">
        <div className="grid content-start gap-6 md:col-span-2 lg:col-span-1">
          <Logo tone="light" height={38} />
          <p className="max-w-[38ch] text-lede text-white/70">
            Dein REWE in Frankfurt-Rödelheim – ein selbstständig geführter Markt der {markt.legalName}.
          </p>
          <a
            href={markt.links.instagram}
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-11 w-fit items-center gap-2.5 rounded-full bg-white/10 px-5 font-semibold ring-1 ring-inset ring-white/15 transition hover:bg-white/16"
          >
            <InstagramIcon className="size-5" />@{markt.instagramHandle}
            <span className="sr-only"> auf Instagram (öffnet in neuem Tab)</span>
          </a>
        </div>

        <div>
          <h2 className="text-eyebrow text-white/45">Besuch</h2>
          <address className="mt-5 not-italic leading-relaxed">
            {markt.address.street}
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

        <div>
          <h2 className="text-eyebrow text-white/45">Seiten</h2>
          <ul className="mt-4 grid">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-11 items-center text-white/85 hover:text-white hover:underline hover:underline-offset-4">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-4 grid gap-1 border-t border-white/10 pt-4">
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
      </div>

      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-2 py-7 text-[0.875rem] text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {markt.legalName}
          </p>
          <p>Frankfurt-Rödelheim · Thudichumstraße 18–22</p>
        </div>
      </div>
    </footer>
  );
}