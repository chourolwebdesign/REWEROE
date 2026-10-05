import "server-only";
import { cache } from "react";
import { markt } from "@/content/markt";
import { addDays, berlinNow } from "@/lib/hours";
import { rowToSpecialDay, type Employment, type Job, type SpecialDayRow, type Termin } from "@/lib/inhalte/rules";
import { SUPABASE_URL } from "@/lib/supabase/config";
import type { HoursConfig } from "@/lib/types";
import { getJson } from "./rest";

const REST = `${SUPABASE_URL}/rest/v1`;

/** Sondertage ab gestern (Berliner Datum), aufsteigend – auch für den Live-Status „geöffnet/geschlossen“ */
export const specialDays = cache(async () => {
  const from = addDays(berlinNow(new Date()).date, -1);
  const rows = await getJson<SpecialDayRow[]>(`${REST}/special_days?select=date,label,closed,opens,closes&date=gte.${from}&order=date`, "Sondertage");
  return rows.map(rowToSpecialDay);
});

/** Reguläre Zeiten aus dem Code mit den Sondertagen aus dem Cockpit */
export const hoursConfig = cache(async (): Promise<HoursConfig> => ({ regular: markt.hours.regular, specialDays: await specialDays() }));

/** Termine ab `from` (Berliner Datum), aufsteigend */
export const eventsFrom = cache(async (from: string) =>
  getJson<Termin[]>(`${REST}/events?select=id,date,time,title,text&date=gte.${from}&order=date,created_at&limit=100`, "Termine"),
);

interface JobRow {
  id: string;
  title: string;
  employment: Employment;
  text: string;
  date_posted: string;
  valid_through: string | null;
}

/** Stellen der Website – RLS liefert nur aktive, nicht abgelaufene */
export const activeJobs = cache(async (): Promise<Job[]> => {
  const rows = await getJson<JobRow[]>(`${REST}/jobs?select=id,title,employment,text,date_posted,valid_through&order=created_at.desc&limit=50`, "Stellen");
  return rows.map((j) => ({
    id: j.id,
    title: j.title,
    employment: j.employment,
    text: j.text,
    datePosted: j.date_posted,
    ...(j.valid_through ? { validThrough: j.valid_through } : {}),
  }));
});
