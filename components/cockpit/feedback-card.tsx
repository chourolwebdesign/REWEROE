"use client";

import { Check, Mail, Phone, Trash2, Undo2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteFeedback, setFeedbackStatus } from "@/app/cockpit/(intern)/feedback/actions";
import { FACE_COLORS, FaceIcon } from "@/components/feedback/face-icon";
import { contactHref, formatBerlin, type FeedbackRow } from "@/lib/feedback/inbox";
import type { Aspect, Lang } from "@/lib/feedback/rules";
import { FEEDBACK_TEXTS } from "@/lib/feedback/texts";
import { cn } from "@/lib/utils";

const de = FEEDBACK_TEXTS.de;
const OFFLINE = "Keine Verbindung – bitte prüfe das Internet und versuche es noch einmal.";
const action = "inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-semibold transition-transform duration-150 active:scale-[0.97] disabled:opacity-60";

/** Eine Rückmeldung im Eingang: Gesicht, Zeit, Bereiche, Kommentar, Kontakt per Tipp; Erledigt/Wieder öffnen, Löschen. */
export function FeedbackCard({ row }: { row: FeedbackRow }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const href = row.contact ? contactHref(row.contact) : null;
  const language = FEEDBACK_TEXTS[row.lang as Lang]?.name ?? row.lang;

  function run(task: () => Promise<{ ok: true } | { error: string }>) {
    setError(null);
    start(async () => {
      try {
        const res = await task();
        if ("error" in res) setError(res.error);
      } catch {
        setError(OFFLINE);
      }
    });
  }

  return (
    <article data-feedback={row.id} aria-busy={pending || undefined} className={cn("rounded-[1.5rem] bg-white p-5", row.status === "erledigt" && "bg-white/70")}>
      <header className="flex items-start gap-3">
        <span className="size-11 shrink-0" style={{ color: FACE_COLORS[row.rating - 1] }}>
          <FaceIcon n={row.rating} className="size-full" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-[1.125rem] font-extrabold">
            {row.rating} von 5 · {de.scale[row.rating - 1]}
          </h2>
          <p className="text-[0.875rem] text-muted">
            {formatBerlin(row.created_at)} · {language}
            {row.google_click && " · zu Google weitergegangen"}
            {row.status === "erledigt" && row.handled_at && ` · erledigt ${formatBerlin(row.handled_at)}`}
          </p>
        </div>
      </header>
      {row.contact && <p className="mt-3 inline-flex rounded-full bg-red-tint px-3 py-1 text-[0.875rem] font-semibold text-red-deep">Rückruf gewünscht</p>}
      {row.aspects.length > 0 && (
        <ul aria-label="Bereiche" className="mt-3 flex flex-wrap gap-1.5">
          {row.aspects.map((a) => (
            <li key={a} className="rounded-full bg-soft px-3 py-1 text-[0.875rem] font-semibold">
              {de.aspects[a as Aspect] ?? a}
            </li>
          ))}
        </ul>
      )}
      {row.comment && <p className="mt-3 break-words whitespace-pre-line">{row.comment}</p>}
      {row.contact && (
        <p className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-semibold">Kontakt:</span>
          {href ? (
            <a href={href} className={cn(action, "bg-ink text-white")}>
              {href.startsWith("tel:") ? <Phone className="size-4" aria-hidden /> : <Mail className="size-4" aria-hidden />}
              {row.contact}
            </a>
          ) : (
            <span className="break-all">{row.contact}</span>
          )}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 rounded-2xl bg-red-tint px-4 py-3 font-semibold text-red-deep">
          {error}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {row.status === "neu" ? (
          <button type="button" data-action="done" disabled={pending} onClick={() => run(() => setFeedbackStatus(row.id, "erledigt"))} className={cn(action, "bg-ink text-white")}>
            <Check className="size-4" aria-hidden /> Erledigt
          </button>
        ) : (
          <button type="button" data-action="reopen" disabled={pending} onClick={() => run(() => setFeedbackStatus(row.id, "neu"))} className={cn(action, "bg-soft text-ink")}>
            <Undo2 className="size-4" aria-hidden /> Wieder öffnen
          </button>
        )}
        <button
          type="button"
          data-action="delete"
          disabled={pending}
          aria-label="Rückmeldung löschen"
          onClick={() => {
            if (confirm("Diese Rückmeldung endgültig löschen?")) run(() => deleteFeedback(row.id));
          }}
          className={cn(action, "text-red hover:bg-red-tint")}
        >
          <Trash2 className="size-4" aria-hidden /> Löschen
        </button>
      </div>
    </article>
  );
}
