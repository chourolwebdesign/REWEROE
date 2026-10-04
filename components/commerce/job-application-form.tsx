"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cta } from "@/components/brand/cta";
import { cn } from "@/lib/utils";
import { boxInput, boxSelect, boxTextarea, Field, plate, StepTrack } from "./form-primitives";

export interface JobOption { slug: string; title: string }

/** Three-step application (§4.28): hairline step track with red fill, box inputs, 240 ms slide, done plate with green check. */
export function JobApplicationForm({ jobs, preselect }: { jobs: JobOption[]; preselect?: string }) {
  const t = useTranslations("career");
  const tc = useTranslations("common");
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ position: preselect ?? "", name: "", email: "", phone: "", message: "", cv: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const steps = [t("step1"), t("step2"), t("step3")];

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 0 && !data.position) e.position = t("errorRequired");
    if (step === 1) {
      if (!data.name.trim()) e.name = t("errorRequired");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(data.email)) e.email = t("errorEmail");
    }
    if (step === 2 && !data.cv) e.cv = t("errorRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const next = () => {
    if (!validate()) return;
    if (step < 2) setStep(step + 1);
    else setDone(true);
  };
  const set = (k: keyof typeof data) => (v: string) => { setData({ ...data, [k]: v }); setErrors({ ...errors, [k]: "" }); };

  if (done) {
    return (
      <div className={`${plate} border-l-[3px] border-l-red text-center`}>
        <Check className="mx-auto h-8 w-8 text-bio-text" strokeWidth={2} aria-hidden />
        <p className="display mt-4 text-2xl text-ink" role="status">{t("done")}</p>
      </div>
    );
  }

  const slide = { initial: { opacity: 0, x: 12 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -12 }, transition: { duration: reduce ? 0 : 0.24, ease: [0.2, 0, 0, 1] as const } };

  return (
    <form onSubmit={(e) => { e.preventDefault(); next(); }} noValidate className={plate}>
      <StepTrack steps={steps} current={step} label={tc("progress")} />

      <AnimatePresence mode="wait" initial={false}>
        <m.div key={step} {...slide} className="mt-8 space-y-5">
          {step === 0 && (
            <Field label={t("position")} error={errors.position} id="position">
              <Select value={data.position} onValueChange={set("position")}>
                <SelectTrigger id="position" aria-invalid={!!errors.position} className={boxSelect}><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>{jobs.map((j) => <SelectItem key={j.slug} value={j.slug}>{j.title}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          )}
          {step === 1 && (
            <>
              <Field label={t("name")} error={errors.name} id="name"><Input id="name" autoComplete="name" value={data.name} onChange={(e) => set("name")(e.target.value)} aria-invalid={!!errors.name} className={boxInput} /></Field>
              <Field label={t("email")} error={errors.email} id="email"><Input id="email" type="email" autoComplete="email" value={data.email} onChange={(e) => set("email")(e.target.value)} aria-invalid={!!errors.email} className={boxInput} /></Field>
              <Field label={`${t("phone")} (${tc("optional")})`} id="phone"><Input id="phone" type="tel" autoComplete="tel" value={data.phone} onChange={(e) => set("phone")(e.target.value)} className={boxInput} /></Field>
            </>
          )}
          {step === 2 && (
            <>
              <Field label={t("message")} id="message"><Textarea id="message" rows={5} value={data.message} onChange={(e) => set("message")(e.target.value)} className={boxTextarea} /></Field>
              <Field label={t("cv")} error={errors.cv} id="cv">
                <Input id="cv" type="file" accept="application/pdf" onChange={(e) => set("cv")(e.target.files?.[0]?.name ?? "")} aria-invalid={!!errors.cv} className={cn(boxInput, "py-3 file:mr-3 file:text-ink")} />
              </Field>
            </>
          )}
        </m.div>
      </AnimatePresence>

      <div className="rule mt-8 flex items-center justify-between gap-4 pt-6">
        <Cta type="button" variant="ghost" arrow={false} size="sm" onClick={() => setStep(Math.max(0, step - 1))} className={cn(step === 0 && "invisible")}>{t("prev")}</Cta>
        <Cta type="submit">{step < 2 ? t("next") : t("submit")}</Cta>
      </div>
    </form>
  );
}
