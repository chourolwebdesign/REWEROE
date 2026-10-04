"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, FileText, Loader2, Paperclip, PartyPopper, Phone, X } from "lucide-react";
import { startTransition, useActionState, useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { submitApplication, type ApplicationState } from "@/app/karriere/bewerben/actions";
import { AREAS, DAYPARTS, DAYS, EMPLOYMENT, UPLOAD } from "@/content/bewerbung";
import { parseApplication, type FieldErrors, type FieldName } from "@/lib/application";
import { cn } from "@/lib/utils";

type Values = {
  bereich: string[];
  art: string;
  start: "sofort" | "datum";
  startDatum: string;
  verfuegbarkeit: string[];
  vorname: string;
  nachname: string;
  telefon: string;
  email: string;
  nachricht: string;
  datenschutz: boolean;
  talentpool: boolean;
};

const EMPTY: Values = {
  bereich: [],
  art: "",
  start: "sofort",
  startDatum: "",
  verfuegbarkeit: [],
  vorname: "",
  nachname: "",
  telefon: "",
  email: "",
  nachricht: "",
  datenschutz: false,
  talentpool: false,
};

const STEPS: { id: string; title: string; fields: FieldName[] }[] = [
  { id: "job", title: "Was möchtest du machen?", fields: ["bereich", "art"] },
  { id: "zeit", title: "Wann kannst du?", fields: ["start"] },
  { id: "kontakt", title: "Wie erreichen wir dich?", fields: ["vorname", "nachname", "telefon", "email", "nachricht", "lebenslauf"] },
  { id: "senden", title: "Fast geschafft!", fields: ["datenschutz"] },
];

const DRAFT_KEY = "rewe-roedelheim-bewerbung";

// Entwurf aus localStorage – einmal beim Laden gelesen (nur im Browser, nur auf diesem Gerät).
let draftCache: string | null | undefined;
const readDraft = () => {
  if (draftCache === undefined) {
    try {
      draftCache = window.localStorage.getItem(DRAFT_KEY);
    } catch {
      draftCache = null;
    }
  }
  return draftCache;
};
const noSubscribe = () => () => {};

const kb = (bytes: number) => (bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB` : `${Math.round(bytes / 1024)} KB`);

/** Fotos werden vor dem Hochladen auf max. 2000 px / JPEG 82 % verkleinert (spart Datenvolumen und hält das 4-MB-Limit). */
async function shrinkImage(file: File): Promise<File> {
  if (!/^image\/(jpeg|png)$/.test(file.type) || file.size < 1_200_000) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.82));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

function Choice({
  type,
  name,
  value,
  checked,
  onChange,
  children,
  invalid,
  describedBy,
}: {
  type: "checkbox" | "radio";
  name: string;
  value: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
  invalid?: boolean;
  describedBy?: string;
}) {
  return (
    <label
      className={cn(
        "relative flex min-h-13 cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 font-semibold ring-1 transition-colors select-none",
        checked ? "bg-ink text-white ring-ink" : "bg-white text-ink ring-line hover:ring-ink/40",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
      )}
    >
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "grid size-5 shrink-0 place-items-center ring-2 transition-colors",
          type === "radio" ? "rounded-full" : "rounded-md",
          checked ? "bg-red ring-red" : "ring-line",
        )}
      >
        {checked && <Check className="size-3.5 text-white" strokeWidth={3} />}
      </span>
      {children}
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 text-[0.9375rem] font-medium text-red" role="alert">
      <X className="mt-0.5 size-4 shrink-0" aria-hidden strokeWidth={2.5} />
      {message}
    </p>
  );
}

const inputClass = (invalid?: boolean) =>
  cn(
    "mt-2 block h-13 w-full rounded-2xl bg-white px-4 text-[1.0625rem] ring-1 transition-shadow outline-none placeholder:text-muted/70",
    "focus:ring-2 focus:ring-ink",
    invalid ? "ring-2 ring-red" : "ring-line",
  );

export function ApplicationForm({ ready, phone, phoneHref }: { ready: boolean; phone: string; phoneHref: string }) {
  const [state, formAction, pending] = useActionState<ApplicationState, FormData>(submitApplication, { status: "idle" });
  const [values, setValues] = useState<Values>(EMPTY);
  const [step, setStep] = useState(0);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [files, setFiles] = useState<File[]>([]);
  const [fileNote, setFileNote] = useState<string | null>(null);
  const [draftDismissed, setDraftDismissed] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const headingRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const topRef = useRef<HTMLDivElement>(null);
  const [touched, setTouched] = useState(false);

  const draftRaw = useSyncExternalStore(noSubscribe, readDraft, () => null);
  const showDraft = Boolean(draftRaw) && !draftDismissed && !touched;

  const serverErrors = state.status === "error" ? (state.errors ?? {}) : {};
  const errors: FieldErrors = { ...serverErrors, ...clientErrors };
  const success = state.status === "success";

  // Zeitstempel für die Bot-Erkennung erst im Browser setzen (die Seite selbst ist statisch).
  useEffect(() => {
    if (startRef.current) startRef.current.value = String(Date.now());
  }, []);

  // Entwurf speichern (ohne Dateien und ohne Datenschutz-Häkchen).
  useEffect(() => {
    if (!touched) return;
    const id = window.setTimeout(() => {
      try {
        const { datenschutz: _d, ...rest } = values;
        void _d;
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
      } catch {}
    }, 400);
    return () => window.clearTimeout(id);
  }, [values, touched]);

  // Nach dem Absenden: Entwurf löschen und die Bestätigung ins Bild holen.
  useEffect(() => {
    if (!success) return;
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {}
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [success]);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setTouched(true);
    setValues((v) => ({ ...v, [key]: value }));
    setClientErrors((e) => {
      if (!(key in e)) return e;
      const next = { ...e };
      delete next[key as FieldName];
      if (key === "email") delete next.telefon;
      return next;
    });
  };
  const toggle = (key: "bereich" | "verfuegbarkeit", id: string, on: boolean) =>
    set(key, on ? [...values[key], id] : values[key].filter((x) => x !== id));

  const restoreDraft = () => {
    try {
      const d = JSON.parse(draftRaw ?? "{}");
      setTouched(true);
      setValues({ ...EMPTY, ...d, datenschutz: false });
    } catch {}
    setDraftDismissed(true);
  };

  /** Prüft die Felder eines Schritts mit derselben Logik wie der Server. */
  function validate(stepIndex: number | "all") {
    const fd = new FormData(formRef.current!);
    const r = parseApplication(fd);
    const all: FieldErrors = r.ok ? {} : r.errors;
    if (fileNote) all.lebenslauf = fileNote;
    const fields = stepIndex === "all" ? STEPS.flatMap((s) => s.fields) : STEPS[stepIndex].fields;
    const relevant = Object.fromEntries(Object.entries(all).filter(([k]) => fields.includes(k as FieldName))) as FieldErrors;
    setClientErrors(relevant);
    return relevant;
  }

  const goTo = (i: number) => {
    setStep(i);
    requestAnimationFrame(() => headingRefs.current[i]?.focus());
  };

  const focusFirstError = (errs: FieldErrors) => {
    requestAnimationFrame(() => {
      const first = formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']");
      first?.focus();
    });
    return errs;
  };

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      const errs = validate(step);
      if (Object.keys(errs).length) focusFirstError(errs);
      else goTo(step + 1);
      return;
    }
    const errs = validate("all");
    if (Object.keys(errs).length) {
      const target = STEPS.findIndex((s) => s.fields.some((f) => f in errs));
      goTo(target);
      focusFirstError(errs);
      return;
    }
    const fd = new FormData(formRef.current!);
    startTransition(() => formAction(fd));
  }

  async function onFiles(list: FileList | null) {
    if (!list) return;
    setTouched(true);
    const picked = await Promise.all([...files, ...Array.from(list)].slice(0, UPLOAD.maxFiles).map(shrinkImage));
    const total = picked.reduce((s, f) => s + f.size, 0);
    setFileNote(
      total > UPLOAD.maxBytes ? "Die Dateien sind zusammen größer als 4 MB. Bitte entferne eine Datei oder lade ein kleineres PDF hoch." : null,
    );
    setFiles(picked);
    syncInput(picked);
  }

  function removeFile(index: number) {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    syncInput(next);
    setFileNote(next.reduce((s, f) => s + f.size, 0) > UPLOAD.maxBytes ? fileNote : null);
  }

  function syncInput(list: File[]) {
    if (!fileRef.current) return;
    try {
      const dt = new DataTransfer();
      list.forEach((f) => dt.items.add(f));
      fileRef.current.files = dt.files;
    } catch {}
  }

  if (success) {
    return (
      <div ref={topRef} className="scroll-mt-28 rounded-[2rem] bg-white p-8 text-center shadow-[var(--shadow-lift)] md:p-14" role="status">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-red-tint">
          <PartyPopper className="size-8 text-red" aria-hidden />
        </span>
        <h2 className="mt-6 text-h2">{state.vorname ? `Danke, ${state.vorname}!` : "Danke!"}</h2>
        <p className="mx-auto mt-4 max-w-[40ch] text-lede text-muted">Deine Bewerbung ist bei uns angekommen. Wir melden uns bei dir.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex h-13 items-center rounded-full bg-ink px-6 font-semibold text-white hover:bg-ink-2">
            Zur Startseite
          </Link>
          <Link href="/karriere" className="inline-flex h-13 items-center rounded-full bg-soft px-6 font-semibold hover:bg-soft-2">
            Zurück zu Karriere
          </Link>
        </div>
      </div>
    );
  }

  const last = STEPS.length - 1;

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={onSubmit}
      noValidate
      className="application-form rounded-[2rem] bg-white shadow-[var(--shadow-lift)]"
    >
      {/* Fortschritt (nur mit JS) */}
      <div className="js-only border-b border-line px-6 py-5 md:px-10">
        <ol className="flex gap-1.5" aria-label="Fortschritt">
          {STEPS.map((s, i) => (
            <li key={s.id} className="flex-1">
              <span className={cn("block h-1.5 rounded-full transition-colors duration-300", i <= step ? "bg-red" : "bg-soft-2")} />
              <span className="sr-only">
                Schritt {i + 1} von {STEPS.length}: {s.title}
                {i === step ? " (aktuell)" : i < step ? " (erledigt)" : ""}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-[0.875rem] font-semibold text-muted" aria-hidden>
          Schritt {step + 1} von {STEPS.length}
        </p>
      </div>

      {!ready && (
        <p className="mx-6 mt-6 rounded-2xl bg-yellow/30 p-4 text-[0.9375rem] ring-1 ring-yellow md:mx-10">
          <strong>Hinweis:</strong> Die Online-Bewerbung wird gerade eingerichtet und nimmt noch keine Bewerbungen an. Bis dahin erreichst du uns am
          schnellsten telefonisch:{" "}
          <a href={phoneHref} className="font-semibold whitespace-nowrap underline underline-offset-4">
            {phone}
          </a>
          .
        </p>
      )}

      {showDraft && (
        <div className="mx-6 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-soft p-4 md:mx-10">
          <p className="text-[0.9375rem]">Du hast schon angefangen. Weitermachen, wo du aufgehört hast?</p>
          <div className="flex gap-2">
            <button type="button" onClick={restoreDraft} className="h-11 rounded-full bg-ink px-4 text-[0.9375rem] font-semibold text-white">
              Weitermachen
            </button>
            <button
              type="button"
              onClick={() => setDraftDismissed(true)}
              className="h-11 rounded-full px-4 text-[0.9375rem] font-semibold hover:bg-white"
            >
              Neu beginnen
            </button>
          </div>
        </div>
      )}

      {/* Bot-Schutz: Honeypot (für Menschen unsichtbar) und Startzeit */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <input ref={startRef} type="hidden" name="t" defaultValue="0" />

      <div className="px-6 pt-6 pb-8 md:px-10 md:pb-10">
        {/* Schritt 1 */}
        <section data-step="0" data-active={step === 0 || undefined} aria-labelledby="schritt-0" className="step">
          <h2
            id="schritt-0"
            ref={(el) => {
              headingRefs.current[0] = el;
            }}
            tabIndex={-1}
            className="text-h3 outline-none"
          >
            {STEPS[0].title}
          </h2>
          <fieldset className="mt-5">
            <legend className="font-semibold">
              Bereich <span className="font-medium text-muted">(Mehrfachauswahl möglich)</span>
            </legend>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {AREAS.map((a) => (
                <Choice
                  key={a.id}
                  type="checkbox"
                  name="bereich"
                  value={a.id}
                  checked={values.bereich.includes(a.id)}
                  onChange={(on) => toggle("bereich", a.id, on)}
                  invalid={Boolean(errors.bereich)}
                  describedBy={errors.bereich ? "bereich-error" : undefined}
                >
                  {a.label}
                </Choice>
              ))}
            </div>
            <FieldError id="bereich-error" message={errors.bereich} />
          </fieldset>

          <fieldset className="mt-8">
            <legend className="font-semibold">Wie möchtest du arbeiten?</legend>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {EMPLOYMENT.map((e) => (
                <Choice
                  key={e.id}
                  type="radio"
                  name="art"
                  value={e.id}
                  checked={values.art === e.id}
                  onChange={() => set("art", e.id)}
                  invalid={Boolean(errors.art)}
                  describedBy={errors.art ? "art-error" : undefined}
                >
                  {e.label}
                </Choice>
              ))}
            </div>
            <FieldError id="art-error" message={errors.art} />
          </fieldset>
        </section>

        {/* Schritt 2 */}
        <section data-step="1" data-active={step === 1 || undefined} aria-labelledby="schritt-1" className="step">
          <h2
            id="schritt-1"
            ref={(el) => {
              headingRefs.current[1] = el;
            }}
            tabIndex={-1}
            className="text-h3 outline-none"
          >
            {STEPS[1].title}
          </h2>
          <fieldset className="mt-5">
            <legend className="font-semibold">Ab wann kannst du anfangen?</legend>
            <div className="mt-3 flex flex-wrap gap-2.5">
              <Choice type="radio" name="start" value="sofort" checked={values.start === "sofort"} onChange={() => set("start", "sofort")}>
                So schnell wie möglich
              </Choice>
              <Choice type="radio" name="start" value="datum" checked={values.start === "datum"} onChange={() => set("start", "datum")}>
                Ab einem Datum
              </Choice>
            </div>
          </fieldset>
          <div className={cn("mt-4 max-w-xs", values.start !== "datum" && "js-hidden")}>
            <label htmlFor="startDatum" className="font-semibold">
              Startdatum
            </label>
            <input
              id="startDatum"
              type="date"
              name="startDatum"
              value={values.startDatum}
              onChange={(e) => set("startDatum", e.target.value)}
              aria-invalid={Boolean(errors.start) || undefined}
              aria-describedby={errors.start ? "start-error" : undefined}
              className={inputClass(Boolean(errors.start))}
            />
          </div>
          <FieldError id="start-error" message={errors.start} />

          <h3 id="slots-label" className="mt-8 font-sans text-[1.0625rem] font-bold tracking-normal">
            Wann passt es dir? <span className="font-medium text-muted">(optional)</span>
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[22rem] border-separate border-spacing-1.5 text-center" aria-labelledby="slots-label">
              <thead>
                <tr>
                  <th scope="col" className="sr-only">
                    Tageszeit
                  </th>
                  {DAYS.map((d) => (
                    <th key={d.id} scope="col" className="text-[0.875rem] font-semibold text-muted">
                      <abbr title={d.long} className="no-underline">
                        {d.label}
                      </abbr>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYPARTS.map((p) => (
                  <tr key={p.id}>
                    <th scope="row" className="pr-2 text-left text-[0.875rem] font-semibold whitespace-nowrap text-muted">
                      {p.label}
                    </th>
                    {DAYS.map((d) => {
                      const id = `${d.id}-${p.id}`;
                      const on = values.verfuegbarkeit.includes(id);
                      return (
                        <td key={id}>
                          <label
                            className={cn(
                              "grid h-12 cursor-pointer place-items-center rounded-xl ring-1 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink",
                              on ? "bg-red text-white ring-red" : "bg-white ring-line hover:ring-ink/40",
                            )}
                          >
                            <input
                              type="checkbox"
                              name="verfuegbarkeit"
                              value={id}
                              checked={on}
                              onChange={(e) => toggle("verfuegbarkeit", id, e.target.checked)}
                              className="sr-only"
                            />
                            <span className="sr-only">
                              {d.long} {p.label}
                            </span>
                            {on ? (
                              <Check className="size-5" aria-hidden strokeWidth={3} />
                            ) : (
                              <span aria-hidden className="size-1.5 rounded-full bg-line" />
                            )}
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Schritt 3 */}
        <section data-step="2" data-active={step === 2 || undefined} aria-labelledby="schritt-2" className="step">
          <h2
            id="schritt-2"
            ref={(el) => {
              headingRefs.current[2] = el;
            }}
            tabIndex={-1}
            className="text-h3 outline-none"
          >
            {STEPS[2].title}
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {(
              [
                ["vorname", "Vorname", "given-name", "text"],
                ["nachname", "Nachname", "family-name", "text"],
                ["telefon", "Telefon", "tel", "tel"],
                ["email", "E-Mail", "email", "email"],
              ] as const
            ).map(([key, label, auto, type]) => (
              <div key={key}>
                <label htmlFor={key} className="font-semibold">
                  {label}
                  {(key === "telefon" || key === "email") && <span className="font-medium text-muted"> (eins von beiden)</span>}
                </label>
                <input
                  id={key}
                  name={key}
                  type={type}
                  autoComplete={auto}
                  inputMode={type === "tel" ? "tel" : type === "email" ? "email" : undefined}
                  value={values[key]}
                  onChange={(e) => set(key, e.target.value)}
                  aria-invalid={Boolean(errors[key]) || undefined}
                  aria-describedby={errors[key] ? `${key}-error` : undefined}
                  className={inputClass(Boolean(errors[key]))}
                />
                <FieldError id={`${key}-error`} message={errors[key]} />
              </div>
            ))}
          </div>

          <div className="mt-5">
            <label htmlFor="nachricht" className="font-semibold">
              Erzähl uns kurz etwas über dich <span className="font-medium text-muted">(optional)</span>
            </label>
            <textarea
              id="nachricht"
              name="nachricht"
              rows={4}
              maxLength={1500}
              value={values.nachricht}
              onChange={(e) => set("nachricht", e.target.value)}
              placeholder="Zum Beispiel: Erfahrung, Sprachen, was dir Spaß macht …"
              aria-invalid={Boolean(errors.nachricht) || undefined}
              aria-describedby={errors.nachricht ? "nachricht-error" : undefined}
              className={cn(inputClass(Boolean(errors.nachricht)), "h-auto py-3 leading-relaxed")}
            />
            <FieldError id="nachricht-error" message={errors.nachricht} />
          </div>

          <div className="mt-5">
            <p id="lebenslauf-label" className="font-semibold">
              Lebenslauf oder Zeugnis <span className="font-medium text-muted">(optional · PDF, JPG oder PNG · bis 4 MB)</span>
            </p>
            <label className="mt-2 flex min-h-16 cursor-pointer items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-line bg-soft/60 px-4 py-4 font-semibold transition-colors hover:border-ink/30 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink">
              <Paperclip className="size-5" aria-hidden />
              Datei auswählen oder Foto machen
              <input
                ref={fileRef}
                type="file"
                name="lebenslauf"
                accept={UPLOAD.accept}
                multiple
                onChange={(e) => void onFiles(e.target.files)}
                aria-labelledby="lebenslauf-label"
                aria-describedby={errors.lebenslauf ? "lebenslauf-error" : undefined}
                className="sr-only"
              />
            </label>
            {files.length > 0 && (
              <ul className="mt-3 grid gap-2">
                {files.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex items-center gap-3 rounded-xl bg-soft px-4 py-2.5">
                    <FileText className="size-5 shrink-0 text-muted" aria-hidden />
                    <span className="min-w-0 flex-1 truncate">{f.name}</span>
                    <span className="text-[0.875rem] text-muted tabular-nums">{kb(f.size)}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="grid size-9 place-items-center rounded-full hover:bg-white"
                      aria-label={`${f.name} entfernen`}
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <FieldError id="lebenslauf-error" message={errors.lebenslauf ?? fileNote ?? undefined} />
          </div>
        </section>

        {/* Schritt 4 */}
        <section data-step="3" data-active={step === 3 || undefined} aria-labelledby="schritt-3" className="step">
          <h2
            id="schritt-3"
            ref={(el) => {
              headingRefs.current[3] = el;
            }}
            tabIndex={-1}
            className="text-h3 outline-none"
          >
            {STEPS[3].title}
          </h2>

          <dl className="js-only mt-5 grid gap-3 rounded-2xl bg-soft p-5 text-[0.9375rem] sm:grid-cols-2">
            <div>
              <dt className="text-muted">Bereich</dt>
              <dd className="font-semibold">{values.bereich.map((b) => AREAS.find((a) => a.id === b)?.label).join(", ") || "–"}</dd>
            </div>
            <div>
              <dt className="text-muted">Beschäftigung</dt>
              <dd className="font-semibold">{EMPLOYMENT.find((e) => e.id === values.art)?.label ?? "–"}</dd>
            </div>
            <div>
              <dt className="text-muted">Start</dt>
              <dd className="font-semibold">
                {values.start === "sofort" ? "So schnell wie möglich" : values.startDatum ? values.startDatum.split("-").reverse().join(".") : "–"}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Kontakt</dt>
              <dd className="font-semibold break-words">
                {[`${values.vorname} ${values.nachname}`.trim(), values.telefon, values.email].filter(Boolean).join(" · ") || "–"}
              </dd>
            </div>
          </dl>

          <div className="mt-6 grid gap-3">
            <Choice
              type="checkbox"
              name="datenschutz"
              value="on"
              checked={values.datenschutz}
              onChange={(on) => set("datenschutz", on)}
              invalid={Boolean(errors.datenschutz)}
              describedBy={errors.datenschutz ? "datenschutz-error" : undefined}
            >
              <span className="font-medium">
                Ich habe die{" "}
                <Link href="/datenschutz#bewerbung" target="_blank" className="font-semibold underline underline-offset-4">
                  Datenschutzhinweise zur Bewerbung
                </Link>{" "}
                gelesen.
              </span>
            </Choice>
            <FieldError id="datenschutz-error" message={errors.datenschutz} />
            <Choice type="checkbox" name="talentpool" value="on" checked={values.talentpool} onChange={(on) => set("talentpool", on)}>
              <span className="font-medium">
                Optional: Ihr dürft meine Bewerbung 12 Monate aufbewahren und mich ansprechen, wenn später etwas frei wird.
              </span>
            </Choice>
          </div>


        </section>

        {state.status === "error" && (
          <div role="alert" className="mt-8 rounded-2xl bg-red-tint p-5 text-red">
            <p className="font-semibold">{state.message}</p>
            {Object.keys(serverErrors).length > 0 && (
              <ul className="mt-2 grid gap-1.5">
                {Object.entries(serverErrors).map(([field, msg]) => {
                  const target = STEPS.findIndex((s) => s.fields.includes(field as FieldName));
                  return (
                    <li key={field} className="flex flex-wrap items-center gap-x-3">
                      <span>{msg}</span>
                      {target >= 0 && target !== step && (
                        <button type="button" onClick={() => goTo(target)} className="js-only font-semibold underline underline-offset-4">
                          Zu Schritt {target + 1}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            className={cn("js-only inline-flex h-13 items-center gap-2 rounded-full px-5 font-semibold hover:bg-soft", step === 0 && "invisible")}
          >
            <ArrowLeft className="size-4" aria-hidden /> Zurück
          </button>
          {step < last ? (
            <button
              type="submit"
              className="js-only inline-flex h-13 items-center gap-2 rounded-full bg-ink px-7 font-semibold text-white hover:bg-ink-2"
            >
              Weiter <ArrowRight className="size-4" aria-hidden />
            </button>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className={cn(
              "inline-flex h-14 items-center gap-2.5 rounded-full bg-red px-8 text-[1.0625rem] font-semibold text-white transition hover:bg-red-hover disabled:opacity-70",
              step < last && "js-hidden",
            )}
          >
            {pending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Check className="size-5" aria-hidden strokeWidth={2.5} />}
            {pending ? "Wird gesendet …" : "Bewerbung absenden"}
          </button>
        </div>
        <p className="mt-4 flex items-start gap-2 text-[0.875rem] text-muted">
          <Phone className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            Lieber persönlich? Ruf uns an:{" "}
            <a href={phoneHref} className="font-semibold whitespace-nowrap text-ink underline-offset-4 hover:underline">
              {phone}
            </a>
          </span>
        </p>
      </div>
    </form>
  );
}
