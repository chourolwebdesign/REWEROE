import "server-only";
import { cache } from "react";
import { markt } from "@/content/markt";
import { flyerLink, pickFlyers, shownFlyer, type FlyerRecord } from "@/lib/prospekt/select";
import { SUPABASE_URL } from "@/lib/supabase/config";
import { getJson } from "./rest";

const FIELDS = "id,week_start,kw,year,valid_from,valid_to,page_count,page_width,page_height,format";

/**
 * Veröffentlichte Prospekte der letzten Wochen (öffentlich über RLS), je Seitenaufbau nur einmal abgefragt (React cache).
 * Ein Fehler bricht den Build ab statt einer Seite ohne Prospekt; zur Laufzeit bleibt der letzte gute Stand online.
 */
export const publishedFlyers = cache(async (): Promise<FlyerRecord[]> =>
  getJson<FlyerRecord[]>(`${SUPABASE_URL}/rest/v1/flyers?select=${FIELDS}&status=eq.published&order=week_start.desc&limit=6`, "Prospekte"),
);

/** Ziel aller „Prospekt“-Knöpfe: der eigene Viewer, wenn ein Prospekt online ist – sonst der REWE-Prospekt. */
export const currentFlyerLink = cache(async () => flyerLink(shownFlyer(pickFlyers(await publishedFlyers(), new Date())), markt.links.flyer));
