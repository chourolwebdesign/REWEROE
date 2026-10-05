"use client";

import { useActionState } from "react";
import { signIn, type SignInState } from "@/app/cockpit/anmelden/actions";
import { buttonClasses } from "@/components/ui/button";

const field = "mt-2 block h-13 w-full rounded-2xl bg-white px-4 text-base ring-1 ring-line outline-none focus-visible:ring-2 focus-visible:ring-ink";

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, {});
  const error = state.error ?? notice;
  return (
    <form action={action} className="grid gap-5" noValidate>
      <input type="hidden" name="weiter" value={next} />
      <label className="font-semibold">
        E-Mail
        <input name="email" type="email" autoComplete="username" required defaultValue={state.email} className={field} />
      </label>
      <label className="font-semibold">
        Passwort
        <input name="passwort" type="password" autoComplete="current-password" required className={field} />
      </label>
      {error && (
        <p role="alert" className="rounded-2xl bg-red-tint px-4 py-3 font-semibold text-red-deep">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className={buttonClasses("red", "lg")}>
        {pending ? "Anmelden …" : "Anmelden"}
      </button>
    </form>
  );
}
