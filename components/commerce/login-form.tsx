"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cta } from "@/components/brand/cta";

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
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email) || pw.length < 6 || (mode === "register" && !name.trim())) return setErr(t("demoNote"));
    try { localStorage.setItem("rewe-rh-user", JSON.stringify({ name: name || email.split("@")[0], email })); } catch {}
    router.push("/konto");
  };
  return (
    <form onSubmit={submit} noValidate className="space-y-5 rounded-[16px] border border-line bg-card p-6 md:p-10">
      <div>
        <p className="eyebrow mb-3">{t("eyebrow")}</p>
        <h1 className="text-[clamp(1.75rem,3vw,2.5rem)] text-forest dark:text-cream">{mode === "login" ? t("loginTitle") : t("registerTitle")}</h1>
        <p className="mt-2 text-sm text-ink-muted">{t("loginText")}</p>
      </div>
      {mode === "register" && <div><Label htmlFor="l-name" className="mb-2 block text-sm">Name</Label><Input id="l-name" value={name} onChange={(e) => setName(e.target.value)} className="h-11" /></div>}
      <div><Label htmlFor="l-email" className="mb-2 block text-sm">E-Mail</Label><Input id="l-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" /></div>
      <div><Label htmlFor="l-pw" className="mb-2 block text-sm">{t("password")}</Label><Input id="l-pw" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={pw} onChange={(e) => setPw(e.target.value)} className="h-11" /></div>
      <p className="mono min-h-4 text-[11px] text-price" aria-live="polite">{err}</p>
      <Cta type="submit" className="w-full">{mode === "login" ? t("login") : t("register")}</Cta>
      <div className="mono flex justify-between text-[11px] uppercase tracking-wider text-ink-muted">
        <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")} className="underline-offset-4 hover:underline">{mode === "login" ? `${t("noAccount")} ${t("register")}` : `${t("hasAccount")} ${t("login")}`}</button>
        {mode === "login" && <button type="button" className="underline-offset-4 hover:underline">{t("forgot")}</button>}
      </div>
      <p className="text-center text-[11px] text-ink-muted">{t("demoNote")}</p>
    </form>
  );
}
