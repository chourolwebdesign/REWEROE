"use client";

import { CheckCircle2 } from "lucide-react";
import { unstable_rethrow } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { buttonClasses } from "@/components/ui/button";
import { formValues, OFFLINE, type FormState } from "@/lib/cockpit/form-state";
import { cn } from "@/lib/utils";

export const fieldClass = "mt-2 block h-13 w-full rounded-2xl bg-soft px-4 text-base font-normal ring-1 ring-line outline-none focus-visible:ring-2 focus-visible:ring-ink";
export const areaClass = "mt-2 block w-full rounded-2xl bg-soft px-4 py-3 text-base font-normal ring-1 ring-line outline-none focus-visible:ring-2 focus-visible:ring-ink";

/**
 * `useActionState` für Cockpit-Formulare: ohne Netz eine Meldung statt der Fehlerseite, die Eingaben bleiben stehen.
 * Next-Weiterleitungen (Sitzung abgelaufen → Anmeldung) gehen durch.
 */
export function useCockpitForm(action: (prev: FormState, fd: FormData) => Promise<FormState>) {
  return useActionState<FormState, FormData>(async (prev, fd) => {
    try {
      return await action(prev, fd);
    } catch (e) {
      unstable_rethrow(e);
      return { error: OFFLINE, values: formValues(fd) };
    }
  }, {});
}

/** Hauptknopf eines Formulars; während des Speicherns gesperrt */
export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn(buttonClasses("red", "lg"), "disabled:opacity-60")}>
      {pending ? "Speichern …" : children}
    </button>
  );
}

/** Meldung nach dem Speichern: Erfolg ruhig (status), Fehler deutlich (alert) */
export function FormMessage({ state }: { state: FormState }) {
  if (state.error) {
    return (
      <p role="alert" className="rounded-2xl bg-red-tint px-4 py-3 font-semibold text-red-deep">
        {state.error}
      </p>
    );
  }
  if (state.ok) {
    return (
      <p role="status" className="flex items-start gap-2 rounded-2xl bg-soft px-4 py-3 font-semibold">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-open" aria-hidden />
        {state.ok}
      </p>
    );
  }
  return null;
}

/** Knopf für eine Aktion an einem Eintrag (Löschen, Ausblenden); fragt vorher nach, wenn `question` gesetzt ist */
export function ActionButton({
  action,
  kind,
  question,
  className,
  children,
}: {
  action: () => Promise<FormState>;
  kind: string;
  question?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        data-action={kind}
        disabled={pending}
        onClick={() => {
          if (question && !confirm(question)) return;
          setError(null);
          start(async () => {
            try {
              const res = await action();
              if (res.error) setError(res.error);
            } catch (e) {
              unstable_rethrow(e);
              setError(OFFLINE);
            }
          });
        }}
        className={cn("inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-semibold transition-transform duration-150 active:scale-[0.97] disabled:opacity-60", className)}
      >
        {children}
      </button>
      {error && (
        <span role="alert" className="px-3 text-[0.875rem] font-semibold text-red-deep">
          {error}
        </span>
      )}
    </span>
  );
}
