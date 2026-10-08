import type { Metadata } from "next";
import { MobileBar } from "@/components/layout/mobile-bar";
import { NOT_FOUND_FLYER, NotFoundContent } from "@/components/layout/not-found-content";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "Seite nicht gefunden",
  robots: { index: false },
};

/** 404 für Adressen ohne Route – liegt außerhalb von app/(site), deshalb Kopf, Footer und Leiste hier selbst (`hero`: roter Kopf unten). */
export default function NotFound() {
  return (
    <>
      <SiteHeader flyer={NOT_FOUND_FLYER} hero />
      <main id="inhalt" tabIndex={-1} className="outline-none">
        <NotFoundContent />
      </main>
      <SiteFooter />
      <MobileBar flyer={NOT_FOUND_FLYER} />
    </>
  );
}
