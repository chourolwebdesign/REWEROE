import type { CleanFeedback } from "./rules";
import { FEEDBACK_TEXTS } from "./texts";

const de = FEEDBACK_TEXTS.de;

/** Mail an die Marktleitung bei 1–2 Sternen – deutsch, mit Link ins Cockpit. */
export function alarmMail(f: CleanFeedback, link: string): { subject: string; text: string } {
  const lines = [
    `Neue Rückmeldung: ${f.rating} von 5 (${de.scale[f.rating - 1]})`,
    `Bereiche: ${f.aspects.length ? f.aspects.map((a) => de.aspects[a]).join(", ") : "–"}`,
    `Kommentar: ${f.comment || "–"}`,
    `Kontakt: ${f.contact || "–"}`,
    `Sprache: ${FEEDBACK_TEXTS[f.lang].name}`,
    "",
    `Im Markt-Cockpit ansehen: ${link}`,
  ];
  return { subject: `Feedback: ${f.rating} von 5 Sternen`, text: lines.join("\n") };
}
