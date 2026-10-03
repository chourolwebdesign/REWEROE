"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cta } from "@/components/brand/cta";

const subjects = ["frage", "bestellung", "produkt", "lob", "presse"] as const;

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

  if (done) return <div className="rounded-[16px] border border-rewe/50 bg-card p-10 text-center"><Check className="mx-auto h-8 w-8 text-rewe" /><p className="serif mt-4 text-2xl" role="status">{t("sent")}</p></div>;

  return (
    <form onSubmit={(e) => { e.preventDefault(); setTouched({ name: true, email: true, subject: true, message: true }); if (valid) setDone(true); }} noValidate className="space-y-5 rounded-[16px] border border-line bg-card p-6 md:p-10">
      <div className="grid gap-5 md:grid-cols-2">
        <div><Label htmlFor="c-name" className="mb-2 block text-sm">{t("name")}</Label><Input id="c-name" value={d.name} onBlur={() => touch("name")} onChange={(e) => setD({ ...d, name: e.target.value })} aria-invalid={!!show("name")} className="h-11" /><Err msg={show("name")} /></div>
        <div><Label htmlFor="c-email" className="mb-2 block text-sm">{t("email")}</Label><Input id="c-email" type="email" value={d.email} onBlur={() => touch("email")} onChange={(e) => setD({ ...d, email: e.target.value })} aria-invalid={!!show("email")} className="h-11" /><Err msg={show("email")} /></div>
      </div>
      <div>
        <Label htmlFor="c-subject" className="mb-2 block text-sm">{t("subject")}</Label>
        <Select value={d.subject} onValueChange={(v) => { setD({ ...d, subject: v }); touch("subject"); }}>
          <SelectTrigger id="c-subject" className="h-11 w-full" aria-invalid={!!show("subject")}><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent>{subjects.map((s) => <SelectItem key={s} value={s}>{t(`subjects.${s}`)}</SelectItem>)}</SelectContent>
        </Select>
        <Err msg={show("subject")} />
      </div>
      <div><Label htmlFor="c-msg" className="mb-2 block text-sm">{t("message")}</Label><Textarea id="c-msg" rows={6} value={d.message} onBlur={() => touch("message")} onChange={(e) => setD({ ...d, message: e.target.value })} aria-invalid={!!show("message")} /><Err msg={show("message")} /></div>
      <Cta type="submit">{t("send")}</Cta>
    </form>
  );
}
function Err({ msg }: { msg: string }) { return <p className="mono mt-1 min-h-4 text-[11px] text-price" aria-live="polite">{msg}</p>; }
