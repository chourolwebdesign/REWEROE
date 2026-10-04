"use client";

import { Check, Minus, Plus, Printer, RotateCcw } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { buttonClasses } from "@/components/ui/button";
import { ShareButton } from "@/components/ui/share-button";
import { CHECKLISTS, DAY_OPTIONS, FOOD } from "@/content/vorrat";
import { cn } from "@/lib/utils";
import { bottles, formatAmount, scaleAmount } from "@/lib/vorrat";

const KEY = "rewe-roedelheim-notvorrat";
type Saved = { persons: number; days: number; checked: string[] };

let savedCache: string | null | undefined;
const readSaved = () => {
  if (savedCache === undefined) {
    try {
      savedCache = window.localStorage.getItem(KEY);
    } catch {
      savedCache = null;
    }
  }
  return savedCache;
};
const noSubscribe = () => () => {};

function parseSaved(raw: string | null): Saved | null {
  try {
    const s = raw ? (JSON.parse(raw) as Saved) : null;
    if (!s || typeof s.persons !== "number") return null;
    return { persons: Math.min(10, Math.max(1, s.persons)), days: DAY_OPTIONS.includes(s.days as never) ? s.days : 10, checked: Array.isArray(s.checked) ? s.checked : [] };
  } catch {
    return null;
  }
}

/** Notvorrat-Rechner nach BBK-Checkliste. Auswahl und Häkchen bleiben nur auf diesem Gerät (localStorage). */
export function VorratRechner({ pageUrl }: { pageUrl: string }) {
  const savedRaw = useSyncExternalStore(noSubscribe, readSaved, () => null);
  const [edited, setEdited] = useState<Saved | null>(null);
  const current: Saved = edited ?? parseSaved(savedRaw) ?? { persons: 2, days: 10, checked: [] };
  const { persons, days, checked } = current;

  const update = (patch: Partial<Saved>) => setEdited({ ...current, ...patch });

  useEffect(() => {
    if (!edited) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(edited));
    } catch {}
  }, [edited]);

  const totalItems = CHECKLISTS.reduce((s, l) => s + l.items.length, 0);
  const doneItems = checked.length;
  const toggle = (id: string) => update({ checked: checked.includes(id) ? checked.filter((x) => x !== id) : [...checked, id] });

  const shareText = [
    `Unser Notvorrat (${persons} ${persons === 1 ? "Person" : "Personen"}, ${days} Tage) nach BBK:`,
    ...FOOD.map((f) => `• ${f.label}: ${formatAmount(scaleAmount(f.amount, persons, days), f.unit)}`),
    "Rechner von REWE Rödelheim:",
  ].join("\n");

  return (
    <div className="vorrat grid gap-4">
      {/* Steuerung */}
      <div className="grid gap-4 rounded-[1.75rem] bg-ink p-6 text-white md:grid-cols-2 md:p-8 print:hidden">
        <div>
          <p id="personen-label" className="font-semibold text-white/75">
            Personen im Haushalt
          </p>
          <div className="mt-3 flex items-center gap-3" role="group" aria-labelledby="personen-label">
            <button
              type="button"
              onClick={() => update({ persons: Math.max(1, persons - 1) })}
              disabled={persons <= 1}
              className="grid size-13 place-items-center rounded-full bg-white/12 ring-1 ring-white/20 transition hover:bg-white/20 disabled:opacity-40"
              aria-label="Eine Person weniger"
            >
              <Minus className="size-5" aria-hidden />
            </button>
            <output aria-live="polite" className="min-w-[3ch] text-center font-display text-[3rem] leading-none font-extrabold tabular-nums">
              {persons}
            </output>
            <button
              type="button"
              onClick={() => update({ persons: Math.min(10, persons + 1) })}
              disabled={persons >= 10}
              className="grid size-13 place-items-center rounded-full bg-white/12 ring-1 ring-white/20 transition hover:bg-white/20 disabled:opacity-40"
              aria-label="Eine Person mehr"
            >
              <Plus className="size-5" aria-hidden />
            </button>
          </div>
        </div>
        <fieldset>
          <legend className="font-semibold text-white/75">Vorrat für</legend>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {DAY_OPTIONS.map((d) => (
              <label
                key={d}
                className={cn(
                  "grid h-13 cursor-pointer place-items-center rounded-2xl font-semibold ring-1 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-white",
                  days === d ? "bg-white text-ink ring-white" : "ring-white/25 hover:bg-white/10",
                )}
              >
                <input type="radio" name="tage" value={d} checked={days === d} onChange={() => update({ days: d })} className="sr-only" />
                {d} Tage
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <h2 className="sr-only">Mengen für {persons === 1 ? "eine Person" : `${persons} Personen`} und {days} Tage</h2>
      <p className="hidden print:block print:text-[1.25rem] print:font-bold">
        Notvorrat für {persons} {persons === 1 ? "Person" : "Personen"} und {days} Tage (Richtwerte nach BBK)
      </p>

      {/* Ergebnis */}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FOOD.map((f, i) => {
          const value = scaleAmount(f.amount, persons, days);
          return (
            <li key={f.id} className={cn("rounded-[1.5rem] p-5 md:p-6", i === 0 ? "bg-red text-white sm:col-span-2 lg:col-span-1 lg:row-span-2" : "bg-soft")}>
              <p className={cn("text-[0.9375rem] font-semibold", i === 0 ? "text-white" : "text-muted")}>{f.label}</p>
              <p className="mt-2 font-display text-[2.5rem] leading-none font-extrabold tracking-[-0.03em] tabular-nums">{formatAmount(value, f.unit)}</p>
              {f.unit === "l" && <p className="mt-2 font-semibold">≈ {bottles(value)} Flaschen à 1,5 l</p>}
              <p className={cn("mt-3 text-[0.9375rem]", i === 0 ? "text-white" : "text-muted")}>{f.examples}</p>
            </li>
          );
        })}
      </ul>
      <p className="text-[0.9375rem] text-muted">
        Richtwerte für Erwachsene (ca. 2.200 kcal am Tag) nach der Checkliste des BBK. Kauf am besten nur, was ihr ohnehin esst, und verbraucht den Vorrat
        regelmäßig.
      </p>

      {/* Checklisten */}
      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-h3">Außerdem in den Vorrat</h2>
        <p className="font-semibold tabular-nums" aria-live="polite">
          {doneItems} von {totalItems} erledigt
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {CHECKLISTS.map((list) => (
          <fieldset key={list.id} className="rounded-[1.5rem] bg-soft p-5 md:p-6">
            <legend className="sr-only">{list.title}</legend>
            <p aria-hidden className="font-display text-[1.25rem] font-bold">
              {list.title}
            </p>
            <ul className="mt-3 grid gap-1">
              {list.items.map((item) => {
                const id = `${list.id}:${item}`;
                const on = checked.includes(id);
                return (
                  <li key={id}>
                    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 hover:bg-white has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink">
                      <input type="checkbox" checked={on} onChange={() => toggle(id)} className="sr-only" />
                      <span aria-hidden className={cn("grid size-6 shrink-0 place-items-center rounded-md ring-2 transition-colors", on ? "bg-red ring-red" : "bg-white ring-line")}>
                        {on && <Check className="size-4 text-white" strokeWidth={3} />}
                      </span>
                      <span className={cn(on && "text-muted line-through")}>{item}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 print:hidden">
        <button type="button" onClick={() => window.print()} className={buttonClasses("ink")}>
          <Printer className="size-[1.05em]" aria-hidden /> Liste drucken
        </button>
        <ShareButton url={pageUrl} title="Notvorrat-Rechner – REWE Rödelheim" text={shareText} label="Liste teilen" />
        <button type="button" onClick={() => update({ persons: 2, days: 10, checked: [] })} className={buttonClasses("outline")}>
          <RotateCcw className="size-[1.05em]" aria-hidden /> Zurücksetzen
        </button>
      </div>
    </div>
  );
}
