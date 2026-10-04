"use client";

import { useEffect } from "react";
import { display, text } from "./fonts";
import "./globals.css";

/** Fehlergrenze für den gesamten Root-Layout-Baum – bringt eigenes <html>/<body> mit. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="de" className={`${display.variable} ${text.variable}`}>
      <body>
        <main className="wrap grid min-h-[100svh] content-center py-20">
          <p className="text-[0.9375rem] font-semibold text-red">Fehler</p>
          <h1 className="mt-3 text-h1">Da ist etwas schiefgelaufen.</h1>
          <p className="mt-4 max-w-[46ch] text-lede text-muted">
            Die Seite konnte gerade nicht geladen werden. Versuch es noch einmal – oder ruf uns an: 069 945158650.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={reset} className="inline-flex h-13 items-center rounded-full bg-red px-6 font-semibold text-white hover:bg-red-hover">
              Noch einmal versuchen
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- harte Navigation verwirft den kaputten Client-Zustand */}
            <a href="/" className="inline-flex h-13 items-center rounded-full bg-soft px-6 font-semibold hover:bg-soft-2">
              Zur Startseite
            </a>
          </div>
          {error.digest && <p className="mt-8 text-[0.8125rem] text-muted">Fehlercode {error.digest}</p>}
        </main>
      </body>
    </html>
  );
}
