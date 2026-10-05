"use client";

import { saveEvent } from "@/app/cockpit/(intern)/inhalte/actions";
import { areaClass, fieldClass, FormMessage, SubmitButton, useCockpitForm } from "./form";

export interface EventDefaults {
  id: string;
  date: string;
  time: string;
  title: string;
  text: string;
}

/** Termin anlegen oder bearbeiten – erscheint auf der Startseite und im Markt-Kalender */
export function EventForm({ defaults }: { defaults: EventDefaults }) {
  const [state, action] = useCockpitForm(saveEvent);
  const v = state.values;
  return (
    <form action={action} noValidate data-form="termin" className="grid gap-5 rounded-[1.75rem] bg-white p-6 md:p-8">
      <h2 className="text-h3">{defaults.id ? "Termin bearbeiten" : "Neuer Termin"}</h2>
      <input type="hidden" name="id" value={defaults.id} />
      <label className="font-semibold">
        Datum
        <input name="date" type="date" required defaultValue={v?.date ?? defaults.date} className={fieldClass} />
      </label>
      <label className="font-semibold">
        Uhrzeit (freiwillig)
        <input name="time" maxLength={40} defaultValue={v?.time ?? defaults.time} placeholder="z. B. 10–14 Uhr" className={fieldClass} />
      </label>
      <label className="font-semibold">
        Titel
        <input name="title" required maxLength={80} defaultValue={v?.title ?? defaults.title} placeholder="z. B. Kürbis-Verkostung" className={fieldClass} />
      </label>
      <label className="font-semibold">
        Text (freiwillig)
        <textarea name="text" maxLength={600} rows={3} defaultValue={v?.text ?? defaults.text} placeholder="Was erwartet die Kundschaft?" className={areaClass} />
      </label>
      <FormMessage state={state} />
      <SubmitButton>{defaults.id ? "Änderungen speichern" : "Termin speichern"}</SubmitButton>
    </form>
  );
}
