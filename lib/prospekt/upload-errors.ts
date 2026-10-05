/**
 * Was die Upload-Maske im Cockpit bei einem Fehler tut. Fortsetzen („Erneut versuchen“) nur, wo es helfen kann –
 * Netzabbruch, Serverfehler, knapper Speicher. Passwort, kaputte Datei, zu alter Browser und abgelaufene Anmeldung
 * brauchen etwas anderes; sonst steckt das Markt-Team in einer Schleife.
 */
export type FailureAction = "retry" | "ready" | "stop";

export interface Failure {
  action: FailureAction;
  message: string;
}

/** Der Server hat den Entwurf abgelehnt, bevor etwas angelegt war (z. B. Woche) → Woche ändern, neu starten. */
export class DraftError extends Error {
  name = "DraftError";
}

const DAMAGED = new Set(["InvalidPDFException", "ResponseException", "MissingPDFException", "UnknownErrorException", "FormatError"]);

export function uploadFailure(e: unknown, ctx: { uploaded: number }): Failure {
  const err = (typeof e === "object" && e !== null ? e : {}) as { name?: string; message?: string; status?: number; statusCode?: string | number };
  const name = err.name ?? "";
  const message = err.message ?? "";
  const resume = `Erneut versuchen setzt bei Seite ${ctx.uploaded + 1} fort.`;

  if (e instanceof DraftError) return { action: "ready", message };
  if (name === "PasswordException") {
    return { action: "stop", message: "Das PDF ist mit einem Passwort geschützt. Bitte ohne Passwort speichern (oder die Original-Datei nehmen) und neu auswählen." };
  }
  if (DAMAGED.has(name)) return { action: "stop", message: "Die Datei ist beschädigt oder kein PDF. Bitte die Original-PDF neu herunterladen und auswählen." };

  const code = String(err.statusCode ?? err.status ?? "");
  if (code === "401" || code === "403" || /jwt|unauthor/i.test(message)) {
    return { action: "stop", message: "Deine Anmeldung ist abgelaufen. Bitte melde dich neu an – danach lädst du das PDF noch einmal hoch." };
  }
  if (name === "StorageApiError") {
    const status = Number(err.status);
    if (status >= 500 || status === 408 || status === 429) return { action: "retry", message: `Der Server antwortet gerade nicht. ${resume}` };
    return { action: "stop", message: `Das Hochladen wurde abgelehnt (Fehler ${status}). Bitte melde dich bei der Agentur.` };
  }
  if (name === "StorageUnknownError" || /fetch|network|load failed/i.test(message)) return { action: "retry", message: `Die Verbindung ist abgebrochen. ${resume}` };
  // pdf.js ruft eine Funktion auf, die der Browser nicht kennt
  if (e instanceof TypeError) {
    return { action: "stop", message: "Dein Browser kann das PDF nicht verarbeiten. Bitte aktualisiere ihn oder nimm einen anderen (z. B. aktuelles Chrome, Edge, Firefox oder Safari)." };
  }
  if (message === "Bild konnte nicht erzeugt werden") {
    return { action: "retry", message: `Eine Seite ließ sich nicht als Bild speichern – meist ist der Speicher knapp. Schließe andere Apps oder Tabs. ${resume}` };
  }
  return { action: "retry", message: `Das hat nicht geklappt. ${resume}` };
}

/** pdf.js braucht auch im Legacy-Build Promise.withResolvers (Safari/iOS ab 17.4, Chrome ab 119). */
export function uploadSupported(g: { Promise: { withResolvers?: unknown } } = globalThis): boolean {
  return typeof g.Promise.withResolvers === "function";
}
