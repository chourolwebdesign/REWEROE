"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cta } from "@/components/brand/cta";
import { boxInput, boxSelect, boxTextarea, Field, plate } from "./form-primitives";

const subjects = ["frage", "bestellung", "produkt", "lob", "presse"] as const;

/** Contact form (§4.28): box inputs, icon + text errors, done state as a paper plate with the 3 px red rule and a green check. */
export function ContactForm() {
  const t = useTranslations("contact");
  const [d, setD] = useState({ name: "", email: "", subject: "", message: "" });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState(false);
  const errors = {
    name: d.name.trim() ? "" : t("errorRequired"),
    email: /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(d.email) ? "" : t("errorEmail"),
    subject: d.subject ? "" : t("errorRequired"),
    message: d.message.trim().length >= 20 ? "" : t("errorMin"),
  };
  const valid = Object.values(errors).every((e) => !e);
  const show = (k: keyof typeof errors) => (touched[k] ? errors[k] : "");
  const touch = (k: string) => setTouched({ ...touched, [k]: true });

  if (done) {
    return (
      <div className={`${plate} border-l-[3px] border-l-red text-center`}>
        <Check className="mx-auto h-8 w-8 text-bio-text" strokeWidth={2} aria-hidden />
        <p className="display mt-4 text-2xl text-ink" role="status">{t("sent")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); setTouched({ name: true, email: true, subject: true, message: true }); if (valid) setDone(true); }} noValidate className={`${plate} space-y-5`}>
      <div className="grid gap-5 md:grid-cols-2">
        <Field id="c-name" label={t("name")} error={show("name")}><Input id="c-name" autoComplete="name" value={d.name} onBlur={() => touch("name")} onChange={(e) => setD({ ...d, name: e.target.value })} aria-invalid={!!show("name")} className={boxInput} /></Field>
        <Field id="c-email" label={t("email")} error={show("email")}><Input id="c-email" type="email" autoComplete="email" value={d.email} onBlur={() => touch("email")} onChange={(e) => setD({ ...d, email: e.target.value })} aria-invalid={!!show("email")} className={boxInput} /></Field>
      </div>
      <Field id="c-subject" label={t("subject")} error={show("subject")}>
        <Select value={d.subject} onValueChange={(v) => { setD({ ...d, subject: v }); touch("subject"); }}>
          <SelectTrigger id="c-subject" className={boxSelect} aria-invalid={!!show("subject")}><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent>{subjects.map((s) => <SelectItem key={s} value={s}>{t(`subjects.${s}`)}</SelectItem>)}</SelectContent>
        </Select>
      </Field>
      <Field id="c-msg" label={t("message")} error={show("message")}><Textarea id="c-msg" rows={6} value={d.message} onBlur={() => touch("message")} onChange={(e) => setD({ ...d, message: e.target.value })} aria-invalid={!!show("message")} className={boxTextarea} /></Field>
      <Cta type="submit">{t("send")}</Cta>
    </form>
  );
}
