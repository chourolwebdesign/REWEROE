"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteFlyer } from "@/app/cockpit/(intern)/prospekt/actions";

export interface WeekRow {
  weekStart: string;
  kw: number;
  range: string;
  flyer: { id: string; pageCount: number; sourceName: string } | null;
}

/** Laufende Woche und die drei folgenden: online oder fehlt; online mit Löschen. */
export function FlyerWeekList({ rows }: { rows: WeekRow[] }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove(id: string, kw: number) {
    if (!confirm(`Prospekt KW ${kw} wirklich löschen?`)) return;
    setError(null);
    start(async () => {
      try {
        const res = await deleteFlyer(id);
        if ("error" in res) setError(res.error);
      } catch {
        setError("Keine Verbindung – bitte prüfe das Internet und versuche es noch einmal.");
      }
    });
  }

  return (
    <>
      {error && (
        <p role="alert" className="mb-3 rounded-2xl bg-red-tint px-4 py-3 font-semibold text-red-deep">
          {error}
        </p>
      )}
      <ul className="grid gap-3">
        {rows.map((r) => (
          <li key={r.weekStart} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 md:p-5">
            <div>
              <p className="font-display text-[1.25rem] font-bold">KW {r.kw}</p>
              <p className="text-[0.9375rem] text-muted">{r.range}</p>
            </div>
            {r.flyer ? (
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-open/10 px-3 py-1 text-[0.875rem] font-semibold text-open-deep">✓ online · {r.flyer.pageCount} Seiten</span>
                <button
                  type="button"
                  data-delete={r.flyer.id}
                  disabled={pending}
                  onClick={() => remove(r.flyer!.id, r.kw)}
                  className="grid size-11 place-items-center rounded-full text-red hover:bg-red-tint"
                  aria-label={`Prospekt KW ${r.kw} löschen`}
                >
                  <Trash2 className="size-5" aria-hidden />
                </button>
              </div>
            ) : (
              <span className="rounded-full bg-soft px-3 py-1 text-[0.875rem] font-semibold text-muted">fehlt</span>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
