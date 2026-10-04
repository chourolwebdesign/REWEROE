const localeMap: Record<string, string> = { de: "de-DE", en: "en-GB" };

/** Intl currency formatting. Keeps Intl's U+00A0 before "€" — U+202F is missing in all three brand fonts (§2.1). */
export function formatPrice(amount: number, locale = "de"): string {
  return new Intl.NumberFormat(localeMap[locale] ?? "de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatNumber(n: number, locale = "de", opts: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat(localeMap[locale] ?? "de-DE", opts).format(n);
}

export function formatWeight(grams: number, locale = "de"): string {
  if (grams >= 1000) return `${formatNumber(grams / 1000, locale, { maximumFractionDigits: 2 })} kg`;
  return `${formatNumber(grams, locale)} g`;
}

export function formatDate(iso: string, locale = "de"): string {
  return new Intl.DateTimeFormat(localeMap[locale] ?? "de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

/** Short validity date for offers and the hero data strip: "Sa. 11.10." (de) / "Sat 11/10" (en). */
export function formatDateShort(iso: string, locale = "de"): string {
  return new Intl.DateTimeFormat(localeMap[locale] ?? "de-DE", { weekday: "short", day: "numeric", month: "numeric" }).format(new Date(iso)).replace(",", "");
}

export function discounted(price: number, percent?: number | null): number {
  if (!percent) return price;
  return Math.round(price * (1 - percent / 100) * 100) / 100;
}

/** Discount badge text with a true minus sign: "−20 %" (de, U+2212 U+00A0 %) · "−20%" (en). */
export function formatDiscount(percent: number, locale = "de"): string {
  const n = Math.round(Math.abs(percent));
  return locale === "en" ? `−${n}%` : `−${n} %`;
}

/**
 * Unit words inside `basePrice.per` that differ per locale. Content stores the German unit ("1 Stück"); this map mirrors
 * `common.piece` ("Stück" / "pc") because this module has no access to next-intl. Keep the two in sync.
 */
const UNIT_WORDS: Record<string, Record<string, string>> = { Stück: { en: "pc" } };

/** Grundpreis line: "1,99 € / kg" (de) · "€1.29 / 1 pc" (en) — always shown next to a price (§0 rule 9). */
export function formatBasePrice(amount: number, per: string, locale = "de"): string {
  const unit = per.split(" ").map((w) => UNIT_WORDS[w]?.[locale] ?? w).join(" ");
  return `${formatPrice(amount, locale)} / ${unit}`;
}
