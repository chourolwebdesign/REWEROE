"use client";
import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, Check } from "lucide-react";
import { Cta } from "@/components/brand/cta";
import { cn } from "@/lib/utils";

interface Props {
  /** `paper` (home section 07) · `block` (footer cols 9–12: tokens flip inside `.on-block`, submit becomes `inverse`). */
  variant?: "paper" | "block";
  className?: string;
}

/** Newsletter form (§4.21): underline input, one primary CTA, error with icon in `text-error`, done state with a Bio-green check. */
export function NewsletterForm({ variant = "paper", className }: Props) {
  const t = useTranslations("home");
  const id = useId();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "done">("idle");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) return setState("error");
    setState("done");
  };

  if (state === "done") {
    return (
      <p className={cn("display flex items-center gap-3 text-2xl text-ink", className)} role="status">
        <Check className="h-5 w-5 shrink-0 text-bio-text" aria-hidden />
        <span>{t("newsletterDone")}</span>
      </p>
    );
  }

  return (
    <form onSubmit={submit} noValidate className={cn("w-full", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="sr-only">{t("newsletterLabel")}</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setState("idle"); }}
            placeholder={t("newsletterPlaceholder")}
            aria-invalid={state === "error"}
            aria-describedby={`${id}-error ${id}-privacy`}
            className="h-12 w-full rounded-none border-0 border-b border-line-strong bg-transparent px-0 text-lg text-ink outline-none transition-colors duration-[var(--dur-ui)] placeholder:text-ink-muted focus:border-b-2 focus:border-red-text"
          />
        </label>
        <Cta type="submit" variant={variant === "block" ? "inverse" : "primary"} arrow>{t("newsletterCta")}</Cta>
      </div>
      <p id={`${id}-error`} className="mt-2 flex min-h-5 items-center gap-1.5 text-[12px] font-medium text-error" aria-live="polite">
        {state === "error" && (
          <>
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>{t("newsletterInvalid")}</span>
          </>
        )}
      </p>
      <p id={`${id}-privacy`} className="mt-1 text-[12px] text-ink-muted">{t("newsletterPrivacy")}</p>
    </form>
  );
}
