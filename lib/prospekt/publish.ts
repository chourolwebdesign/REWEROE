/** Angaben zum Veröffentlichen, wie sie die Upload-Maske schickt (die Server-Aktion ist ein öffentlicher Endpunkt). */
export interface PublishInput {
  id: string;
  pageCount: number;
  pageWidth: number;
  pageHeight: number;
  format: "webp" | "jpg";
}

const within = (n: number, min: number, max: number) => Number.isInteger(n) && n >= min && n <= max;

/** Fehlermeldung oder null – geprüft, bevor sich irgendetwas ändert. */
export function checkPublishInput(i: PublishInput): string | null {
  const ok = within(i.pageCount, 1, 80) && within(i.pageWidth, 100, 4000) && within(i.pageHeight, 100, 6000) && (i.format === "webp" || i.format === "jpg");
  return ok ? null : "Ungültige Angaben zum Prospekt.";
}
