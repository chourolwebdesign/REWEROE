"use client";

import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { markGoogleClick, sendFeedback } from "@/app/feedback/actions";
import { LogoMark } from "@/components/brand/logo";
import { buttonClasses } from "@/components/ui/button";
import { ASPECTS, LANGS, MAX_COMMENT, MAX_CONTACT, PROMOTE, type Aspect, type Lang } from "@/lib/feedback/rules";
import { FEEDBACK_TEXTS } from "@/lib/feedback/texts";
import { cn } from "@/lib/utils";
import { Confetti } from "./confetti";
import { FACE_COLORS, FaceIcon } from "./face-icon";
import { Faces } from "./faces";

type Step = "rate" | "details" | "done";
type ErrorKey = "errorInvalid" | "errorTooMany" | "errorFailed";

/** Überschrift mit hervorgehobenem (rotem) Mittelteil */
function Emph({ parts }: { parts: readonly [string, string, string] }) {
  return (
    <>
      {parts[0]}
      <span className="text-red">{parts[1]}</span>
      {parts[2]}
    </>
  );
}

const field = "mt-2 block w-full rounded-2xl px-4 text-base ring-1 ring-line outline-none focus-visible:ring-2 focus-visible:ring-ink";

/**
 * Feedback aus dem Markt (QR-Plakat): Gesicht antippen → zufrieden: Dank und großer Google-Knopf; sonst erst Bereiche,
 * Kommentar und freiwilliger Kontakt, dann Dank und ein ruhiger Google-Link. Fünf Sprachen, Arabisch von rechts nach links.
 */
export function FeedbackFlow({ initialLang, googleUrl, surveyUrl }: { initialLang: Lang; googleUrl: string; surveyUrl: string }) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [step, setStep] = useState<Step>("rate");
  const [rating, setRating] = useState(0);
  const [aspects, setAspects] = useState<Aspect[]>([]);
  const [comment, setComment] = useState("");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(null);
  const [sentId, setSentId] = useState<string | null>(null);
  // Sperre gegen doppeltes Senden: ein Doppeltipp kommt vor dem nächsten Rendern an
  const sending = useRef(false);
  const advance = useRef<number | undefined>(undefined);
  const heading = useRef<HTMLHeadingElement>(null);
  const shownStep = useRef<Step>(step);
  const t = FEEDBACK_TEXTS[lang];
  const good = rating >= PROMOTE;

  // Schrittwechsel: Überschrift fokussieren – Screenreader hören den Wechsel, auf dem Handy rückt sie ins Bild
  useEffect(() => {
    if (shownStep.current !== step) heading.current?.focus();
    shownStep.current = step;
  }, [step]);
  useEffect(() => () => window.clearTimeout(advance.current), []);

  async function submit(r: number) {
    if (sending.current || sentId) return;
    sending.current = true;
    setBusy(true);
    setError(null);
    const details = r < PROMOTE;
    try {
      const res = await sendFeedback({ rating: r, aspects: details ? aspects : [], comment: details ? comment : "", contact: details ? contact : "", lang });
      if ("id" in res) {
        setSentId(res.id);
        setStep("done");
      } else {
        setError(res.error === "zu-viele" ? "errorTooMany" : res.error === "ungueltig" ? "errorInvalid" : "errorFailed");
      }
    } catch {
      setError("errorFailed");
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  function pick(n: number, go: boolean) {
    if (sending.current) return;
    setRating(n);
    setError(null);
    window.clearTimeout(advance.current);
    if (!go) return;
    // kurz zeigen, was gewählt ist – dann weiter: zufrieden → senden und danken, sonst erst zuhören
    advance.current = window.setTimeout(() => (n >= PROMOTE ? void submit(n) : setStep("details")), 450);
  }

  const toggle = (a: Aspect) => setAspects((list) => (list.includes(a) ? list.filter((x) => x !== a) : [...list, a]));

  const alert = error && (
    <p role="alert" className="mt-6 rounded-2xl bg-red-tint px-4 py-3 font-semibold text-red-deep">
      {t[error]}
    </p>
  );

  return (
    <div data-feedback-root lang={lang} dir={t.dir} className="mx-auto flex min-h-[100dvh] w-full max-w-xl flex-col px-4 pt-4 pb-8 sm:px-6">
      <header className="flex items-center justify-between gap-3">
        {/* ohne Prefetch: wer im Markt den QR-Code scannt, will selten zur Startseite – spart mobile Daten */}
        <Link href="/" prefetch={false} dir="ltr" className="flex min-h-11 items-center gap-2">
          <LogoMark height={26} />
          <span className="font-display text-[1.05rem] font-extrabold">Rödelheim</span>
          <span className="sr-only"> – zur Website</span>
        </Link>
        <label className="flex items-center">
          <span className="sr-only">{t.languageLabel}</span>
          <select
            data-lang-select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            className="h-11 rounded-full bg-white px-3 text-base font-semibold ring-1 ring-line outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            {LANGS.map((l) => (
              <option key={l} value={l} lang={l}>
                {FEEDBACK_TEXTS[l].name}
              </option>
            ))}
          </select>
        </label>
      </header>

      {/* Bewerten und Dank sitzen mittig – auf dem Handy in Daumennähe, ohne leere untere Hälfte */}
      <main id="inhalt" className="mt-6 flex flex-1 flex-col">
        {step === "rate" && (
          <section aria-labelledby="feedback-titel" className="my-auto py-6">
            <h1 id="feedback-titel" ref={heading} tabIndex={-1} className="text-h1 outline-none">
              <Emph parts={t.h1} />
            </h1>
            <p className="mt-4 text-lede text-muted">{t.p1}</p>
            <div className="mt-10">
              <Faces value={rating} labels={t.scale} groupLabel={t.facesLabel} rtl={t.dir === "rtl"} onSelect={pick} />
            </div>
            <p aria-live="polite" className="mt-6 min-h-[3.75rem] text-center">
              <span className="block font-display text-[1.375rem] font-extrabold">{busy ? t.sending : rating ? t.scale[rating - 1] : t.pick}</span>
              {rating > 0 && !busy && <span className="block text-muted">{t.hint[rating - 1]}</span>}
            </p>
            {alert}
            {error && good && (
              <button type="button" onClick={() => submit(rating)} className={cn(buttonClasses("ink", "lg"), "mt-4 w-full")}>
                {t.retry}
              </button>
            )}
          </section>
        )}

        {step === "details" && (
          <section aria-labelledby="feedback-titel" className="py-4">
            <button type="button" onClick={() => setStep("rate")} className="inline-flex min-h-11 items-center gap-2 font-semibold text-muted hover:text-ink">
              <ArrowLeft className="size-5 rtl:rotate-180" aria-hidden />
              {t.back}
            </button>
            <h1 id="feedback-titel" ref={heading} tabIndex={-1} className="mt-3 text-h2 outline-none">
              <Emph parts={t.h2} />
            </h1>
            <p className="mt-3 text-muted">{t.p2}</p>
            <div role="group" aria-label={t.aspectsLabel} className="mt-6 flex flex-wrap gap-2">
              {ASPECTS.map((a) => {
                const on = aspects.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    aria-pressed={on}
                    data-aspect={a}
                    onClick={() => toggle(a)}
                    className={cn("min-h-11 rounded-full px-4 font-semibold ring-1 transition-colors duration-150", on ? "bg-ink text-white ring-ink" : "bg-white text-ink ring-line hover:ring-ink")}
                  >
                    {t.aspects[a]}
                  </button>
                );
              })}
            </div>
            <label className="mt-8 block font-semibold">
              {t.noteLabel}
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={MAX_COMMENT} rows={4} placeholder={t.notePlaceholder} className={cn(field, "bg-white py-3")} />
            </label>
            <div className="mt-6 rounded-[1.5rem] bg-white p-5 ring-1 ring-line">
              <p className="font-display text-[1.2rem] font-extrabold">{t.contactTitle}</p>
              <p className="mt-1 text-muted">{t.contactText}</p>
              <label className="mt-4 block font-semibold">
                {t.contactLabel}
                <input
                  data-contact
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  maxLength={MAX_CONTACT}
                  type="text"
                  autoComplete="email"
                  dir="ltr"
                  placeholder={t.contactPlaceholder}
                  className={cn(field, "h-13 bg-soft")}
                />
              </label>
              <p className="mt-2 text-[0.875rem] text-muted">{t.contactNote}</p>
            </div>
            {alert}
            <button type="button" data-action="send" disabled={busy} onClick={() => submit(rating)} className={cn(buttonClasses("red", "lg"), "mt-6 w-full")}>
              {busy ? t.sending : t.send}
            </button>
          </section>
        )}

        {step === "done" && (
          <section aria-labelledby="feedback-titel" data-feedback-done data-feedback-id={sentId ?? undefined} className="my-auto py-6">
            <div aria-hidden="true" className="mx-auto size-24" style={{ color: FACE_COLORS[rating - 1] }}>
              <FaceIcon n={rating} className="size-full" />
            </div>
            <h1 id="feedback-titel" ref={heading} tabIndex={-1} className="mt-6 text-center text-h2 outline-none">
              {good ? t.thanksGood : t.thanksBad}
            </h1>
            <p className="mt-3 text-center text-lede text-muted">{good ? t.leadGood : t.leadBad}</p>
            {!good && (
              <div data-care className="mt-8 rounded-[1.5rem] bg-white p-5 ring-1 ring-line">
                <p className="font-display text-[1.2rem] font-extrabold">{t.careTitle}</p>
                <p className="mt-1 text-muted">{t.careText}</p>
              </div>
            )}
            <div className={cn("mt-8 text-center", good && "rounded-[1.75rem] bg-white p-6 shadow-[var(--shadow-lift)]")}>
              <p className={good ? "text-lede font-semibold" : "text-muted"}>{good ? t.pitchGood : t.pitchBad}</p>
              {good ? (
                <>
                  {/* 4–5 Sterne: groß zur Kundenumfrage der REWE Group (Wunsch des Markts); Google bleibt unten im Fuß */}
                  <a data-survey href={surveyUrl} target="_blank" rel="noopener" className={cn(buttonClasses("ink", "lg"), "mt-4 w-full gap-2")}>
                    {t.surveyButton}
                    <ExternalLink className="size-[1.05em] rtl:-scale-x-100" aria-hidden />
                    <span className="sr-only"> ({t.surveyNewTab})</span>
                  </a>
                  <p className="mt-3 text-[0.875rem] text-muted">{t.surveyNote}</p>
                </>
              ) : (
                <a
                  data-google="dezent"
                  href={googleUrl}
                  target="_blank"
                  rel="noopener"
                  onClick={() => {
                    if (sentId) void markGoogleClick(sentId);
                  }}
                  className={cn(buttonClasses("outline"), "mt-4 w-full gap-2")}
                >
                  {t.googleButton}
                  <ExternalLink className="size-[1.05em] rtl:-scale-x-100" aria-hidden />
                  <span className="sr-only"> ({t.newTab})</span>
                </a>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="mt-12 grid gap-2 text-[0.875rem] text-muted">
        {/* Google für alle und in jedem Schritt – auch wenn das Senden scheitert (keine selektive Einholung); nach 1–3 Sternen steht
            er ruhig im Dank, nach 4–5 Sternen bleibt er hier unten (im Dank steht dann die REWE-Umfrage) */}
        {(step !== "done" || good) && (
          <p>
            <a
              data-google-footer
              href={googleUrl}
              target="_blank"
              rel="noopener"
              onClick={() => {
                if (sentId) void markGoogleClick(sentId);
              }}
              className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-ink underline underline-offset-4"
            >
              {step === "done" ? t.googleButton : t.googleFooter}
              <ExternalLink className="size-[1em] rtl:-scale-x-100" aria-hidden />
              <span className="sr-only"> ({t.newTab})</span>
            </a>
          </p>
        )}
        <p>
          {t.privacy}{" "}
          <a href="/datenschutz#feedback" className="font-semibold text-ink underline underline-offset-4">
            {t.privacyLink}
          </a>
        </p>
      </footer>
      {step === "done" && good && <Confetti />}
    </div>
  );
}
