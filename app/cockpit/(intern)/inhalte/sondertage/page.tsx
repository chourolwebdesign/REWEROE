import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { ActionButton } from "@/components/cockpit/form";
import { SpecialDayForm, type SpecialDayDefaults } from "@/components/cockpit/special-day-form";
import { markt } from "@/content/markt";
import { requireEditor } from "@/lib/cockpit/auth";
import { berlinNow, formatDayMonth, formatTime, WEEKDAYS_SHORT, weekdayOf } from "@/lib/hours";
import { openSuggestions, rowToSpecialDay, type SpecialDayRow } from "@/lib/inhalte/rules";
import { deleteSpecialDay } from "../actions";

export const metadata: Metadata = { title: "Sondertage" };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const hhmm = (t: string | null) => (t ? t.slice(0, 5) : "");

export default async function SondertagePage({ searchParams }: PageProps<"/cockpit/inhalte/sondertage">) {
  const { supabase } = await requireEditor();
  const params = await searchParams;
  const today = berlinNow(new Date()).date;
  const { data, error } = await supabase.from("special_days").select("date,label,closed,opens,closes").gte("date", today).order("date");
  if (error) throw new Error("Sondertage konnten nicht geladen werden.");
  const rows = data as SpecialDayRow[];
  const suggestions = openSuggestions({ regular: markt.hours.regular, specialDays: rows.map(rowToSpecialDay) }, today, 120);
  const editing = rows.find((r) => r.date === one(params.datum));
  // Bearbeiten: Werte des Eintrags; sonst Vorschlag aus der Adresse (?datum=&bezeichnung=&von=&bis=) oder leer
  const defaults: SpecialDayDefaults = editing
    ? { date: editing.date, label: editing.label, closed: editing.closed, opens: hhmm(editing.opens), closes: hhmm(editing.closes) }
    : { date: one(params.datum), label: one(params.bezeichnung), closed: false, opens: one(params.von), closes: one(params.bis) };

  return (
    <>
      <p className="text-eyebrow text-red">
        <Link href="/cockpit/inhalte" className="hover:underline">
          Inhalte
        </Link>
      </p>
      <h1 className="mt-2 text-h2">Sondertage</h1>
      <p className="mt-3 max-w-[60ch] text-muted">
        Feiertage in Hessen stehen automatisch auf der Website. Hier trägst du ein, was davon abweicht – etwa kürzere Zeiten an Heiligabend
        oder einen geschlossenen Tag wegen Inventur.
      </p>

      {suggestions.length > 0 && (
        <section aria-labelledby="vorschlaege" className="mt-6 rounded-[1.75rem] bg-red-tint p-5 md:p-6">
          <h2 id="vorschlaege" className="font-display text-[1.25rem] font-extrabold text-red-deep">
            Noch festzulegen
          </h2>
          <p className="mt-1 text-[0.9375rem]">Bis dahin zeigt die Website die gesetzliche Grenze als vorläufige Zeit.</p>
          <ul className="mt-3 grid gap-2">
            {suggestions.map((s) => {
              const [von, bis] = s.hours ?? ["", ""];
              const q = new URLSearchParams({ datum: s.date, bezeichnung: s.label ?? "", von, bis });
              return (
                <li key={s.date} className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    {WEEKDAYS_SHORT[s.weekday]} {formatDayMonth(s.date)} · {s.label} – laut Gesetz höchstens bis {formatTime(bis)}
                  </span>
                  <Link href={`/cockpit/inhalte/sondertage?${q}`} className="inline-flex min-h-11 items-center rounded-full bg-white px-4 font-semibold">
                    Zeiten festlegen<span className="sr-only">: {s.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="grid gap-3">
          {editing && (
            <Link href="/cockpit/inhalte/sondertage" className="inline-flex min-h-11 w-fit items-center rounded-full bg-white px-4 font-semibold">
              + Neuer Sondertag
            </Link>
          )}
          <SpecialDayForm key={defaults.date || "neu"} defaults={defaults} editing={Boolean(editing)} />
        </div>
        <section aria-labelledby="geplant" className="rounded-[1.75rem] bg-white p-6 md:p-8">
          <h2 id="geplant" className="text-h3">
            Geplant
          </h2>
          {rows.length ? (
            <ul className="mt-4 grid gap-3">
              {rows.map((r) => (
                <li key={r.date} data-sondertag={r.date} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-soft p-4">
                  <div>
                    <p className="font-semibold">
                      {WEEKDAYS_SHORT[weekdayOf(r.date)]} {formatDayMonth(r.date)} · {r.label}
                    </p>
                    <p className="text-[0.9375rem] text-muted">{r.closed ? "geschlossen" : `${hhmm(r.opens)}–${hhmm(r.closes)} Uhr`}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/cockpit/inhalte/sondertage?datum=${r.date}`} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-semibold hover:bg-white">
                      <Pencil className="size-4" aria-hidden /> Bearbeiten<span className="sr-only">: {r.label}</span>
                    </Link>
                    <ActionButton action={deleteSpecialDay.bind(null, r.date)} kind="delete" question={`${r.label} am ${formatDayMonth(r.date)} löschen?`} className="text-red hover:bg-red-tint">
                      <Trash2 className="size-4" aria-hidden /> Löschen<span className="sr-only">: {r.label}</span>
                    </ActionButton>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-muted">Noch keine Sondertage geplant.</p>
          )}
        </section>
      </div>
    </>
  );
}
