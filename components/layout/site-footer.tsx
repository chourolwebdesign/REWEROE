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
      <div className="wrap grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_0.8fr] lg:py-20">
        <div className="grid content-start gap-5">
          <Logo tone="light" height={38} />
          <p className="max-w-[34ch] text-white/70">Dein REWE in Frankfurt-Rödelheim – ein selbstständig geführter Markt der {markt.legalName}.</p>
          <a
            href={markt.links.instagram}
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-11 items-center gap-2.5 justify-self-start rounded-full bg-white/10 px-4 font-semibold ring-1 ring-white/15 transition hover:bg-white/16"
          >
            <InstagramIcon className="size-5" />@{markt.instagramHandle}
            <span className="sr-only"> auf Instagram (öffnet in neuem Tab)</span>
          </a>
        </div>

        <div>
          <h2 className="font-sans text-[0.9375rem] font-semibold tracking-normal text-white/60">Adresse</h2>
          <address className="mt-3 not-italic leading-relaxed">
            {markt.address.street}
            <br />
            {markt.address.zip} {markt.address.city}
          </address>
          <a href={`tel:${markt.phone.e164}`} className="mt-3 inline-flex min-h-11 items-center font-semibold underline-offset-4 hover:underline">
            {markt.phone.display}
          </a>
        </div>

        <div>
          <h2 className="font-sans text-[0.9375rem] font-semibold tracking-normal text-white/60">Öffnungszeiten</h2>
          <dl className="mt-3 grid gap-1">
            {weekRows().map((r) => (
              <div key={r.days} className="flex justify-between gap-4">
                <dt>{r.daysShort}</dt>
                <dd className="tabular-nums text-white/80">{r.time}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-[0.875rem] text-white/55">An Feiertagen geschlossen.</p>
        </div>

        <nav aria-label="Fußzeile">
          <h2 className="font-sans text-[0.9375rem] font-semibold tracking-normal text-white/60">Seiten</h2>
          <ul className="mt-2 grid">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-10 items-center text-white/85 hover:text-white hover:underline hover:underline-offset-4">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-3 py-6 text-[0.875rem] text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {markt.legalName}
          </p>
          <ul className="flex gap-5">
            <li>
              <Link href="/impressum" className="inline-flex min-h-11 items-center hover:text-white hover:underline">
                Impressum
              </Link>
            </li>
            <li>
              <Link href="/datenschutz" className="inline-flex min-h-11 items-center hover:text-white hover:underline">
                Datenschutz
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
