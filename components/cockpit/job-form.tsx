"use client";

import { saveJob } from "@/app/cockpit/(intern)/inhalte/actions";
import { EMPLOYMENTS } from "@/lib/inhalte/rules";
import { areaClass, fieldClass, FormMessage, SubmitButton, useCockpitForm } from "./form";

export interface JobDefaults {
  id: string;
  title: string;
  employment: string;
  text: string;
  validThrough: string;
  active: boolean;
}

/** Stelle anlegen oder bearbeiten – erscheint auf /karriere mit Stellenangaben für Suchmaschinen (JobPosting) */
export function JobForm({ defaults }: { defaults: JobDefaults }) {
  const [state, action] = useCockpitForm(saveJob);
  const v = state.values;
  const employment = v?.employment ?? defaults.employment;
  return (
    <form action={action} noValidate data-form="stelle" className="grid gap-5 rounded-[1.75rem] bg-white p-6 md:p-8">
      <h2 className="text-h3">{defaults.id ? "Stelle bearbeiten" : "Neue Stelle"}</h2>
      <input type="hidden" name="id" value={defaults.id} />
      <label className="font-semibold">
        Titel
        <input name="title" required maxLength={80} defaultValue={v?.title ?? defaults.title} placeholder="z. B. Verkäufer:in Obst und Gemüse (m/w/d)" className={fieldClass} />
      </label>
      <label className="font-semibold">
        Anstellung
        {/* neu aufbauen, wenn sich der Wert ändert: React übernimmt ein geändertes defaultValue bei <select> nicht, und das
            Zurücksetzen nach der Aktion fiele sonst auf den ersten Wert zurück */}
        <select key={employment} name="employment" required defaultValue={employment} className={fieldClass}>
          {EMPLOYMENTS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </label>
      <label className="font-semibold">
        Beschreibung
        <textarea name="text" required maxLength={1500} rows={5} defaultValue={v?.text ?? defaults.text} placeholder="Aufgaben, Stunden, was du mitbringst" className={areaClass} />
      </label>
      <label className="font-semibold">
        Gültig bis (freiwillig)
        <input name="validThrough" type="date" defaultValue={v?.validThrough ?? defaults.validThrough} className={fieldClass} />
      </label>
      <label className="flex min-h-11 items-center gap-3 font-semibold">
        <input name="active" type="checkbox" defaultChecked={v ? v.active === "on" : defaults.active} className="size-5 accent-red" />
        Auf der Website zeigen
      </label>
      <FormMessage state={state} />
      <SubmitButton>{defaults.id ? "Änderungen speichern" : "Stelle speichern"}</SubmitButton>
    </form>
  );
}
