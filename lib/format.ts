const localeMap: Record<string, string> = { de: "de-DE", en: "en-GB" };

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

export function discounted(price: number, percent?: number | null): number {
  if (!percent) return price;
  return Math.round(price * (1 - percent / 100) * 100) / 100;
}
