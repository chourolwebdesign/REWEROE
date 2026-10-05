import type { Metadata } from "next";
import Link from "next/link";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { ActionButton } from "@/components/cockpit/form";
import { JobForm, type JobDefaults } from "@/components/cockpit/job-form";
import { requireEditor } from "@/lib/cockpit/auth";
import { berlinNow, formatDayMonth } from "@/lib/hours";
import type { Employment } from "@/lib/inhalte/rules";
import { deleteJob, setJobActive } from "../actions";

export const metadata: Metadata = { title: "Stellen" };

interface JobRow {
  id: string;
  title: string;
  employment: Employment;
  text: string;
  valid_through: string | null;
  active: boolean;
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function StellenPage({ searchParams }: PageProps<"/cockpit/inhalte/stellen">) {
  const { supabase } = await requireEditor();
  const params = await searchParams;
  const today = berlinNow(new Date()).date;
  const { data, error } = await supabase.from("jobs").select("id,title,employment,text,valid_through,active").order("created_at", { ascending: false });
  if (error) throw new Error("Stellen konnten nicht geladen werden.");
  const rows = data as JobRow[];
  const editing = rows.find((r) => r.id === one(params.id));
  const defaults: JobDefaults = editing
    ? { id: editing.id, title: editing.title, employment: editing.employment, text: editing.text, validThrough: editing.valid_through ?? "", active: editing.active }
    : { id: "", title: "", employment: "Teilzeit", text: "", validThrough: "", active: true };
  const visibility = (r: JobRow) => (!r.active ? "ausgeblendet" : r.valid_through && r.valid_through < today ? "abgelaufen" : "online");

  return (
    <>
      <p className="text-eyebrow text-red">
        <Link href="/cockpit/inhalte" className="hover:underline">
          Inhalte
        </Link>
      </p>
      <h1 className="mt-2 text-h2">Stellen</h1>
      <p className="mt-3 max-w-[60ch] text-muted">
        Offene Stellen stehen auf der Karriereseite, mit Angaben, die Suchmaschinen als Stellenanzeige lesen können. „Ausblenden“ nimmt eine
        Stelle von der Website, ohne sie zu löschen.
      </p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="grid gap-3">
          {editing && (
            <Link href="/cockpit/inhalte/stellen" className="inline-flex min-h-11 w-fit items-center rounded-full bg-white px-4 font-semibold">
              + Neue Stelle
            </Link>
          )}
          <JobForm key={defaults.id || "neu"} defaults={defaults} />
        </div>
        <section aria-labelledby="alle-stellen" className="rounded-[1.75rem] bg-white p-6 md:p-8">
          <h2 id="alle-stellen" className="text-h3">
            Alle Stellen
          </h2>
          {rows.length ? (
            <ul className="mt-4 grid gap-3">
              {rows.map((r) => (
                <li key={r.id} data-stelle={r.id} className="grid gap-2 rounded-2xl bg-soft p-4">
                  <div>
                    <p className="font-semibold">{r.title}</p>
                    <p className="text-[0.9375rem] text-muted">
                      {r.employment} · {visibility(r)}
                      {r.valid_through && ` · bis ${formatDayMonth(r.valid_through)}${r.valid_through.slice(0, 4)}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <Link href={`/cockpit/inhalte/stellen?id=${r.id}`} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-semibold hover:bg-white">
                      <Pencil className="size-4" aria-hidden /> Bearbeiten<span className="sr-only">: {r.title}</span>
                    </Link>
                    <ActionButton action={setJobActive.bind(null, r.id, !r.active)} kind="toggle" className="hover:bg-white">
                      {r.active ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                      {r.active ? "Ausblenden" : "Wieder zeigen"}
                      <span className="sr-only">: {r.title}</span>
                    </ActionButton>
                    <ActionButton action={deleteJob.bind(null, r.id)} kind="delete" question={`Stelle „${r.title}“ löschen?`} className="text-red hover:bg-red-tint">
                      <Trash2 className="size-4" aria-hidden /> Löschen<span className="sr-only">: {r.title}</span>
                    </ActionButton>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-muted">Noch keine eigenen Stellen – die Karriereseite verweist dann auf die REWE-Stellensuche.</p>
          )}
        </section>
      </div>
    </>
  );
}
