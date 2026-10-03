"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cta } from "@/components/brand/cta";
import { cn } from "@/lib/utils";

export interface JobOption { slug: string; title: string }

export function JobApplicationForm({ jobs, preselect }: { jobs: JobOption[]; preselect?: string }) {
  const t = useTranslations("career");
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

  if (done) return <div className="rounded-[16px] border border-rewe/50 bg-card p-10 text-center"><Check className="mx-auto h-8 w-8 text-rewe" /><p className="serif mt-4 text-2xl" role="status">{t("done")}</p></div>;

  return (
    <form onSubmit={(e) => { e.preventDefault(); next(); }} noValidate className="rounded-[16px] border border-line bg-card p-6 md:p-10">
      <ol className="mb-8 grid grid-cols-3 gap-2" aria-label="Fortschritt">
        {steps.map((s, i) => (
          <li key={s} className="space-y-2">
            <div className="h-1 overflow-hidden rounded-full bg-forest/10 dark:bg-cream/10"><motion.div className="h-full bg-rewe" initial={false} animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} /></div>
            <p className={cn("mono text-[11px] uppercase tracking-wider", i === step ? "text-forest dark:text-cream" : "text-ink-muted")}>{String(i + 1).padStart(2, "0")} · {s}</p>
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.35 }} className="space-y-5">
          {step === 0 && (
            <Field label={t("position")} error={errors.position} id="position">
              <Select value={data.position} onValueChange={set("position")}>
                <SelectTrigger id="position" aria-invalid={!!errors.position} className="h-11 w-full"><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>{jobs.map((j) => <SelectItem key={j.slug} value={j.slug}>{j.title}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          )}
          {step === 1 && (
            <>
              <Field label={t("name")} error={errors.name} id="name"><Input id="name" value={data.name} onChange={(e) => set("name")(e.target.value)} aria-invalid={!!errors.name} className="h-11" /></Field>
              <Field label={t("email")} error={errors.email} id="email"><Input id="email" type="email" value={data.email} onChange={(e) => set("email")(e.target.value)} aria-invalid={!!errors.email} className="h-11" /></Field>
              <Field label={`${t("phone")} (optional)`} id="phone"><Input id="phone" type="tel" value={data.phone} onChange={(e) => set("phone")(e.target.value)} className="h-11" /></Field>
            </>
          )}
          {step === 2 && (
            <>
              <Field label={t("message")} id="message"><Textarea id="message" rows={5} value={data.message} onChange={(e) => set("message")(e.target.value)} /></Field>
              <Field label={t("cv")} error={errors.cv} id="cv"><Input id="cv" type="file" accept="application/pdf" onChange={(e) => set("cv")(e.target.files?.[0]?.name ?? "")} aria-invalid={!!errors.cv} className="h-11 pt-2" /></Field>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex justify-between">
        <Cta type="button" variant="ghost" arrow={false} onClick={() => setStep(Math.max(0, step - 1))} className={cn(step === 0 && "invisible")}>{t("prev")}</Cta>
        <Cta type="submit">{step < 2 ? t("next") : t("submit")}</Cta>
      </div>
    </form>
  );
}

function Field({ label, error, id, children }: { label: string; error?: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <Label htmlFor={id} className="mb-2 block text-sm">{label}</Label>
      {children}
      <p className="mono mt-1 min-h-4 text-[11px] text-price" aria-live="polite">{error}</p>
    </div>
  );
}
