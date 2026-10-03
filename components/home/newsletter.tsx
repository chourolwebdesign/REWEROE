"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Cta } from "@/components/brand/cta";

export function NewsletterForm() {
  const t = useTranslations("home");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "done">("idle");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) return setState("error");
    setState("done");
  };
  if (state === "done") return <p className="serif text-2xl text-rewe" role="status">{t("newsletterDone")}</p>;
  return (
    <form onSubmit={submit} noValidate className="w-full max-w-lg">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">E-Mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setState("idle"); }}
            placeholder={t("newsletterPlaceholder")}
            aria-invalid={state === "error"}
            aria-describedby="nl-error"
            className="h-13 w-full border-0 border-b border-gold/70 bg-transparent px-1 py-3 text-lg outline-none placeholder:text-cream/40 focus:border-gold"
          />
        </label>
        <Cta type="submit" variant="gold" className="border-gold text-cream hover:text-forest">{t("newsletterCta")}</Cta>
      </div>
      <p id="nl-error" className="mono mt-2 min-h-5 text-[11px] text-price" aria-live="polite">{state === "error" ? t("newsletterInvalid") : ""}</p>
      <p className="text-xs text-cream/50">{t("newsletterPrivacy")}</p>
    </form>
  );
}
