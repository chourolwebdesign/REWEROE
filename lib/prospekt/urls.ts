import type { FlyerRecord } from "./select";

const file = (page: number, size: "full" | "thumb", format: string) => `${size === "thumb" ? "thumb-" : ""}${page}.${format}`;

/** Öffentlicher Pfad über die eigene Domain (Rewrite in next.config.ts) – Besucher laden nichts direkt von Supabase. */
export const flyerImage = (f: Pick<FlyerRecord, "id" | "format">, page: number, size: "full" | "thumb") => `/prospekt-bilder/${f.id}/${file(page, size, f.format)}`;

/** Pfad im Storage-Bucket „prospekte“. */
export const flyerObjectPath = (id: string, page: number, size: "full" | "thumb", format: "webp" | "jpg") => `${id}/${file(page, size, format)}`;
