/**
 * Ergebnis eines Cockpit-Formulars oder einer Aktion. `values` hält nach einem Fehler die Eingaben: React setzt ein Formular nach
 * jeder Aktion auf seine `defaultValue` zurück, die Formulare nehmen deshalb `values` als `defaultValue`.
 */
export interface FormState {
  ok?: string;
  error?: string;
  values?: Record<string, string>;
}

export const OFFLINE = "Keine Verbindung – bitte prüfe das Internet und versuche es noch einmal.";
/** offener Tab nach einem Update der Website: der Server kennt die Aktionen dieser Seite nicht mehr */
export const STALE = "Das Cockpit wurde aktualisiert – bitte lade die Seite neu und versuche es noch einmal.";

/** Texteingaben eines Formulars, ohne Dateien und ohne die internen Felder von React/Next (beginnen mit „$“) */
export function formValues(fd: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of fd) if (typeof value === "string" && !key.startsWith("$")) out[key] = value;
  return out;
}
