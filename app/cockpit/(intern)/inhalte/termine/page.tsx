import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { EventForm, type EventDefaults } from "@/components/cockpit/event-form";
import { ActionButton } from "@/components/cockpit/form";
import { requireEditor } from "@/lib/cockpit/auth";
import { berlinNow, formatDayMonth, WEEKDAYS_SHORT, weekdayOf } from "@/lib/hours";
import type { Termin } from "@/lib/inhalte/rules";
import { deleteEvent } from "../actions";

export const metadata: Metadata = { title: "Termine" };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function TerminePage({ searchParams }: PageProps<"/cockpit/inhalte/termine">) {
  const { supabase } = await requireEditor();
  const params = await searchParams;
  const today = berlinNow(new Date()).date;
  const { data, error } = await supabase.from("events").select("id,date,time,title,text").gte("date", today).order("date").order("created_at");
  if (error) throw new Error("Termine konnten nicht geladen werden.");
  const rows = data as Termin[];
  const editing = rows.find((r) => r.id === one(params.id));
  const defaults: EventDefaults = editing ?? { id: "", date: "", time: "", title: "", text: "" };

  return (
    <>
      <p className="text-eyebrow text-red">
        <Link href="/cockpit/inhalte" className="hover:underline">
          Inhalte
        </Link>
      </p>
      <h1 className="mt-2 text-h2">Termine</h1>
      <p className="mt-3 max-w-[60ch] text-muted">Termine erscheinen auf der Startseite unter „Demnächst im Markt“ und im Markt-Kalender – bis zum Tag selbst.</p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="grid gap-3">
          {editing && (
            <Link href="/cockpit/inhalte/termine" className="inline-flex min-h-11 w-fit items-center rounded-full bg-white px-4 font-semibold">
              + Neuer Termin
            </Link>
          )}
          <EventForm key={defaults.id || "neu"} defaults={defaults} />
        </div>
        <section aria-labelledby="kommend" className="rounded-[1.75rem] bg-white p-6 md:p-8">
          <h2 id="kommend" className="text-h3">
            Kommend
          </h2>
          {rows.length ? (
            <ul className="mt-4 grid gap-3">
              {rows.map((r) => (
                <li key={r.id} data-termin={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-soft p-4">
                  <div>
                    <p className="font-semibold">
                      {WEEKDAYS_SHORT[weekdayOf(r.date)]} {formatDayMonth(r.date)} · {r.title}
                    </p>
                    {r.time && <p className="text-[0.9375rem] text-muted">{r.time}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/cockpit/inhalte/termine?id=${r.id}`} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-semibold hover:bg-white">
                      <Pencil className="size-4" aria-hidden /> Bearbeiten<span className="sr-only">: {r.title}</span>
                    </Link>
                    <ActionButton action={deleteEvent.bind(null, r.id)} kind="delete" question={`Termin „${r.title}“ löschen?`} className="text-red hover:bg-red-tint">
                      <Trash2 className="size-4" aria-hidden /> Löschen<span className="sr-only">: {r.title}</span>
                    </ActionButton>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-muted">Keine kommenden Termine.</p>
          )}
        </section>
      </div>
    </>
  );
}
