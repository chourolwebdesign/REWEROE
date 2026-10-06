"use client";

import { saveSpecialDay } from "@/app/cockpit/(intern)/inhalte/actions";
import { formatDayMonth, WEEKDAYS, weekdayOf } from "@/lib/hours";
import { fieldClass, FormMessage, SubmitButton, useCockpitForm } from "./form";

export interface SpecialDayDefaults {
  date: string;
  label: string;
  closed: boolean;
  opens: string;
  closes: string;
}

/**
 * Sondertag festlegen: ganztägig geschlossen oder geänderte Zeiten. Ein Eintrag mit demselben Datum wird ersetzt.
 * Beim Bearbeiten steht das Datum fest – das Datum ist der Schlüssel, ein anderer Tag ist ein neuer Eintrag.
 * „Geschlossen“ ist ein ungesteuertes Feld und blendet die Zeiten per CSS aus: React setzt das Formular nach jeder Aktion
 * zurück, ein React-Zustand liefe danach auseinander mit dem Häkchen.
 */
export function SpecialDayForm({ defaults, editing }: { defaults: SpecialDayDefaults; editing: boolean }) {
  const [state, action] = useCockpitForm(saveSpecialDay);
  const v = state.values;
  return (
    <form action={action} noValidate data-form="sondertag" className="group grid gap-5 rounded-[1.75rem] bg-white p-6 md:p-8">
      <h2 className="text-h3">{editing ? "Sondertag bearbeiten" : "Sondertag festlegen"}</h2>
      {editing ? (
        <div>
          <p className="font-semibold">Datum</p>
          <p className="mt-2">
            {WEEKDAYS[weekdayOf(defaults.date)]}, {formatDayMonth(defaults.date)}
            {defaults.date.slice(0, 4)}
          </p>
          <input type="hidden" name="date" value={defaults.date} />
        </div>
      ) : (
        <label className="font-semibold">
          Datum
          <input name="date" type="date" required defaultValue={v?.date ?? defaults.date} className={fieldClass} />
        </label>
      )}
      <label className="font-semibold">
        Bezeichnung
        <input name="label" required maxLength={60} defaultValue={v?.label ?? defaults.label} placeholder="z. B. Heiligabend oder Inventur" className={fieldClass} />
      </label>
      <label className="flex min-h-11 items-center gap-3 font-semibold">
        <input name="closed" type="checkbox" defaultChecked={v ? v.closed === "on" : defaults.closed} className="size-5 accent-red" />
        Ganztägig geschlossen
      </label>
      <div className="grid grid-cols-2 gap-3 group-has-[[name=closed]:checked]:hidden">
        <label className="font-semibold">
          von
          <input name="opens" type="time" required defaultValue={v?.opens ?? defaults.opens} className={fieldClass} />
        </label>
        <label className="font-semibold">
          bis
          <input name="closes" type="time" required defaultValue={v?.closes ?? defaults.closes} className={fieldClass} />
        </label>
      </div>
      <FormMessage state={state} view="/kontakt#zeiten-titel" />
      <SubmitButton>Speichern</SubmitButton>
    </form>
  );
}
