"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Cta } from "@/components/brand/cta";
import { boxInput, Field, FieldError, plate } from "./form-primitives";

/** Login / register (§4.28): paper sheet, 48 px box inputs, error with icon, one primary CTA. Demo mode — no server; the demo note is dev-only. */
export function LoginForm() {
  const t = useTranslations("account");
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email) || pw.length < 6 || (mode === "register" && !name.trim())) return setErr(t("errorCredentials"));
    try { localStorage.setItem("rewe-rh-user", JSON.stringify({ name: name || email.split("@")[0], email })); } catch {}
    router.push("/konto");
  };
  const linkBtn = "min-h-11 text-left text-[13px] font-medium text-ink-muted underline-offset-4 transition-colors duration-[var(--dur-ui)] hover:text-ink hover:underline";
  return (
    <form onSubmit={submit} noValidate className={`${plate} space-y-5`}>
      <div>
        <p className="eyebrow mb-3">{t("eyebrow")}</p>
        <h1 className="text-[clamp(1.75rem,3vw,2.5rem)] text-ink">{mode === "login" ? t("loginTitle") : t("registerTitle")}</h1>
        <p className="mt-2 text-sm text-ink-muted">{t("loginText")}</p>
      </div>
      {mode === "register" && (
        <Field id="l-name" label={t("name")}><Input id="l-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={boxInput} /></Field>
      )}
      <Field id="l-email" label={t("email")}><Input id="l-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!err} aria-describedby={err ? "l-error" : undefined} className={boxInput} /></Field>
      <Field id="l-pw" label={t("password")}><Input id="l-pw" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={pw} onChange={(e) => setPw(e.target.value)} aria-invalid={!!err} aria-describedby={err ? "l-error" : undefined} className={boxInput} /></Field>
      <FieldError id="l-error" msg={err} className="-mt-3" />
      <Cta type="submit" className="w-full">{mode === "login" ? t("login") : t("register")}</Cta>
      <div className="flex flex-wrap items-center gap-x-4">
        <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setErr(""); }} className={linkBtn}>
          {mode === "login" ? `${t("noAccount")} ${t("register")}` : `${t("hasAccount")} ${t("login")}`}
        </button>
      </div>
      {/* No password reset exists without a server — a dead „Passwort vergessen?" would only promise one. */}
      {process.env.NODE_ENV !== "production" && <p className="rule pt-4 text-center text-[12px] text-ink-muted">{t("demoNote")}</p>}
    </form>
  );
}
