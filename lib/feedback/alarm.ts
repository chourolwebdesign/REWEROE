import type { CleanFeedback } from "./rules";
import { FEEDBACK_TEXTS } from "./texts";

const de = FEEDBACK_TEXTS.de;

/**
 * Mail an die Marktleitung bei 1–2 Sternen – deutsch, mit Link ins Cockpit. Kommentar und Kontakt stehen nicht darin:
 * in der Datenbank gelten Löschfristen (Kontakt 90 Tage), in Postfächern nicht.
 */
export function alarmMail(f: CleanFeedback, link: string): { subject: string; text: string } {
  const lines = [
    `Neue Rückmeldung: ${f.rating} von 5 (${de.scale[f.rating - 1]})`,
    `Bereiche: ${f.aspects.length ? f.aspects.map((a) => de.aspects[a]).join(", ") : "–"}`,
    `Kommentar: ${f.comment ? "ja" : "nein"}`,
    `Rückruf gewünscht: ${f.contact ? "ja" : "nein"}`,
    `Sprache: ${FEEDBACK_TEXTS[f.lang].name}`,
    "",
    `Kommentar und Kontakt stehen nur im Markt-Cockpit: ${link}`,
  ];
  return { subject: `Feedback: ${f.rating} von 5 Sternen`, text: lines.join("\n") };
}
