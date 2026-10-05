"use client";

import { useEffect } from "react";
import { buttonClasses } from "@/components/ui/button";

/** Fehlergrenze des Cockpits – statt der öffentlichen Fehlerseite („ruf uns an“) ein Hinweis für das Markt-Team. */
export default function CockpitError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="wrap grid min-h-[70dvh] content-center py-16">
      <h1 className="text-h2">Da hat etwas nicht geklappt.</h1>
      <p className="mt-3 max-w-[46ch] text-muted">Meist war kurz die Verbindung weg. Versuch es noch einmal – hilft das nicht, melde dich bei der Agentur.</p>
      <div className="cta-row mt-6">
        <button type="button" onClick={() => retry()} className={buttonClasses("red", "lg")}>
          Noch einmal versuchen
        </button>
        {/* harte Navigation verwirft den kaputten Zustand */}
        <a href="/cockpit" className={buttonClasses("soft", "lg")}>
          Zur Übersicht
        </a>
      </div>
    </main>
  );
}
