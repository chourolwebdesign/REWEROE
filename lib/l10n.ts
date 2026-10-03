import type { Locale } from "@/i18n/routing";

/** A string that may carry per-locale variants. German is the canonical fallback. */
export type L10n = string | { de: string; en?: string };

/** Resolve a localized value for the given locale, falling back to German. */
export function tx(value: L10n | null | undefined, locale: string): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  const l = locale as Locale;
  return value[l] ?? value.de ?? "";
}
