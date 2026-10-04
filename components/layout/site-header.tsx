"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { OpenStatus } from "@/components/live/open-status";
import { InstallApp } from "@/components/pwa/install-app";
import { buttonClasses, ButtonLink } from "@/components/ui/button";
import { InstagramIcon } from "@/components/ui/icons";
import { markt } from "@/content/markt";
import { NAV } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Kopfzeile, 72 px, sticky. Auf der Startseite liegt sie transparent über der Story und wird beim Scrollen weiß.
 * Mobil öffnet der Menüknopf ein Vollbild-Menü (natives <dialog>: Fokusfalle, Esc, inerter Hintergrund).
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [atTop, setAtTop] = useState(true);
  const overHero = pathname === "/" && atTop;
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < window.innerHeight - 96);
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Nach einer Navigation das Menü schließen.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-[4.5rem] transition-[background-color,color,box-shadow] duration-300",
        overHero ? "on-dark bg-transparent text-white" : "bg-white/92 text-ink shadow-[0_1px_0_var(--color-line)] backdrop-blur-xl",
      )}
    >
      <a
        href="#inhalt"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-red focus:px-5 focus:py-3 focus:font-semibold focus:text-white"
      >
        Zum Inhalt springen
      </a>
      <div className="wrap flex h-full items-center gap-6">
        <Logo tone={overHero ? "light" : "dark"} />

        <nav aria-label="Hauptnavigation" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "relative inline-flex h-11 items-center rounded-full px-4 text-[0.9375rem] font-medium transition-colors",
                    overHero ? "text-white/85 hover:bg-white/12 hover:text-white" : "text-ink-2 hover:bg-soft",
                    isActive(item.href) && (overHero ? "text-white" : "bg-soft text-ink"),
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <ButtonLink href={markt.links.flyer} external size="sm" variant={overHero ? "white" : "red"} className="hidden sm:inline-flex">
            Prospekt
          </ButtonLink>
          <button
            type="button"
            onClick={() => dialogRef.current?.showModal()}
            className={cn("grid size-11 place-items-center rounded-full transition lg:hidden", overHero ? "hover:bg-white/12" : "hover:bg-soft")}
            aria-label="Menü öffnen"
            aria-haspopup="dialog"
          >
            <Menu className="size-6" aria-hidden />
          </button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-label="Menü"
        className="m-0 h-[100dvh] max-h-none w-full max-w-none bg-night p-0 text-white backdrop:bg-black/60 open:flex open:flex-col"
      >
        <div className="wrap flex h-[4.5rem] shrink-0 items-center justify-between">
          <Logo tone="light" />
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="grid size-11 place-items-center rounded-full hover:bg-white/12"
            aria-label="Menü schließen"
          >
            <X className="size-6" aria-hidden />
          </button>
        </div>
        <nav aria-label="Hauptnavigation (mobil)" className="wrap mt-6 flex-1 overflow-y-auto">
          <ul className="grid gap-1">
            {[{ href: "/", label: "Start" }, ...NAV].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => dialogRef.current?.close()}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="flex min-h-14 items-center border-b border-white/10 font-display text-[2rem] font-bold tracking-[-0.02em] aria-[current=page]:text-red-bright"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 grid gap-3 pb-10">
            <OpenStatus tone="dark" className="justify-self-start" />
            <p className="text-white/75">
              {markt.address.street}, {markt.address.zip} {markt.address.city}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <ButtonLink href={markt.links.flyer} external>
                Prospekt der Woche
              </ButtonLink>
              <a href={"tel:" + markt.phone.e164} className={buttonClasses("glass")}>
                <Phone className="size-[1.1em]" aria-hidden />
                Anrufen
              </a>
              <a href={markt.links.instagram} target="_blank" rel="noopener" className={buttonClasses("glass")}>
                <InstagramIcon className="size-[1.1em]" />
                Instagram<span className="sr-only"> (öffnet in neuem Tab)</span>
              </a>
              <InstallApp variant="glass" />
            </div>
          </div>
        </nav>
      </dialog>
    </header>
  );
}
