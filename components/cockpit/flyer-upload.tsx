"use client";

import { FileUp, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createDraft, discardDraft, publishDraft } from "@/app/cockpit/(intern)/prospekt/actions";
import { buttonClasses } from "@/components/ui/button";
import { pdfPageCount, pickFormat, renderPdfPages } from "@/lib/prospekt/render";
import { flyerObjectPath } from "@/lib/prospekt/urls";
import { suggestUploadWeek, uploadWeekChoices, type UploadWeek } from "@/lib/prospekt/week";
import { supabaseBrowser } from "@/lib/supabase/browser";

const MAX_BYTES = 60 * 1024 * 1024;
const MAX_PAGES = 80;
const PREVIEW = 8;

type Phase =
  | { name: "idle" }
  | { name: "ready"; file: File; week: UploadWeek }
  | { name: "working"; file: File; week: UploadWeek; done: number; total: number }
  | { name: "review"; file: File; week: UploadWeek; total: number }
  | { name: "failed"; file: File; week: UploadWeek; message: string; resumable: boolean }
  | { name: "done"; kw: number };

/** Stand des laufenden Uploads (nicht für die Anzeige – die nutzt State). */
interface Progress {
  id?: string;
  uploaded: number;
  width: number;
  height: number;
  format: "webp" | "jpg";
}

/** Prospekt hochladen: PDF wählen → Woche prüfen → Seiten im Browser erzeugen und hochladen → Vorschau → veröffentlichen. */
export function FlyerUpload() {
  const [phase, setPhase] = useState<Phase>({ name: "idle" });
  const [previews, setPreviews] = useState<string[]>([]);
  // nach dem Anlegen des Entwurfs ist die Woche fest
  const [locked, setLocked] = useState(false);
  const progress = useRef<Progress>({ uploaded: 0, width: 0, height: 0, format: "webp" });
  const previewUrls = useRef<string[]>([]);
  const choices = uploadWeekChoices(new Date());

  // Vorschau-URLs freigeben, wenn die Komponente verschwindet
  useEffect(() => {
    const urls = previewUrls.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  function reset() {
    previewUrls.current.forEach((u) => URL.revokeObjectURL(u));
    previewUrls.current.length = 0;
    setPreviews([]);
    setLocked(false);
    const forced = new URLSearchParams(location.search).get("format") === "jpg";
    progress.current = { uploaded: 0, width: 0, height: 0, format: forced ? "jpg" : pickFormat() };
  }

  function choose(file: File | undefined) {
    if (!file) return;
    reset();
    const week = suggestUploadWeek(file.name, new Date());
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) return setPhase({ name: "failed", file, week, message: "Das ist keine PDF-Datei.", resumable: false });
    if (file.size > MAX_BYTES) return setPhase({ name: "failed", file, week, message: "Das PDF ist größer als 60 MB.", resumable: false });
    setPhase({ name: "ready", file, week });
  }

  async function run(file: File, week: UploadWeek) {
    const p = progress.current;
    try {
      const total = await pdfPageCount(file);
      if (total > MAX_PAGES) return setPhase({ name: "failed", file, week, message: "Das PDF hat mehr als 80 Seiten.", resumable: false });
      setPhase({ name: "working", file, week, done: p.uploaded, total });
      if (!p.id) {
        const res = await createDraft({ weekStart: week.weekStart, sourceName: file.name });
        if ("error" in res) return setPhase({ name: "failed", file, week, message: res.error, resumable: false });
        p.id = res.id;
        setLocked(true);
      }
      const bucket = supabaseBrowser().storage.from("prospekte");
      const contentType = p.format === "webp" ? "image/webp" : "image/jpeg";
      for await (const page of renderPdfPages(file, { format: p.format, fullWidth: 1800, thumbWidth: 480, from: p.uploaded + 1 })) {
        for (const [size, blob] of [["full", page.full], ["thumb", page.thumb]] as const) {
          const { error } = await bucket.upload(flyerObjectPath(p.id, page.n, size, p.format), blob, { contentType, cacheControl: "31536000", upsert: true });
          if (error) throw error;
        }
        if (page.n === 1) Object.assign(p, { width: page.width, height: page.height });
        if (page.n <= PREVIEW) {
          const url = URL.createObjectURL(page.thumb);
          previewUrls.current.push(url);
          setPreviews((list) => [...list, url]);
        }
        p.uploaded = page.n;
        setPhase({ name: "working", file, week, done: page.n, total: page.total });
      }
      setPhase({ name: "review", file, week, total: p.uploaded });
    } catch (e) {
      const err = e as { statusCode?: string | number; status?: number; message?: string };
      const code = String(err.statusCode ?? err.status ?? "");
      const expired = code === "401" || code === "403" || /jwt|unauthor/i.test(err.message ?? "");
      setPhase({
        name: "failed",
        file,
        week,
        resumable: !expired,
        message: expired
          ? "Deine Anmeldung ist abgelaufen. Bitte melde dich neu an – danach lädst du das PDF noch einmal hoch."
          : `Die Verbindung ist abgebrochen. Erneut versuchen setzt bei Seite ${p.uploaded + 1} fort.`,
      });
    }
  }

  async function publish(file: File, week: UploadWeek) {
    const p = progress.current;
    const res = await publishDraft({ id: p.id!, pageCount: p.uploaded, pageWidth: p.width, pageHeight: p.height, format: p.format });
    if ("error" in res) return setPhase({ name: "failed", file, week, message: res.error, resumable: true });
    reset();
    setPhase({ name: "done", kw: res.kw });
  }

  async function discard() {
    if (progress.current.id) await discardDraft(progress.current.id);
    reset();
    setPhase({ name: "idle" });
  }

  if (phase.name === "done") {
    return (
      <div data-upload-done className="rounded-[1.75rem] bg-white p-6 md:p-8">
        <h2 className="text-h3">Fertig! KW {phase.kw} ist online.</h2>
        <p className="mt-2 text-muted">Die Website zeigt den Prospekt in wenigen Sekunden.</p>
        <div className="cta-row mt-6">
          <a href="/angebote" target="_blank" rel="noopener" className={buttonClasses("ink")}>
            Auf der Website ansehen<span className="sr-only"> (öffnet in neuem Tab)</span>
          </a>
          <button type="button" onClick={() => setPhase({ name: "idle" })} className={buttonClasses("soft")}>
            Weiteren Prospekt hochladen
          </button>
        </div>
      </div>
    );
  }

  if (phase.name === "review") {
    const { file, week, total } = phase;
    return (
      <div data-upload-review className="rounded-[1.75rem] bg-white p-6 md:p-8">
        <h2 className="text-h3">Passt alles?</h2>
        <p className="mt-2 text-muted">
          KW {week.kw} · {week.range} · {total} Seiten. So sieht der Prospekt auf der Website aus{total > PREVIEW ? ` (erste ${PREVIEW} Seiten)` : ""}.
        </p>
        <ul className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {previews.map((src, i) => (
            <li key={src}>
              {/* eslint-disable-next-line @next/next/no-img-element -- lokale Vorschau (Blob-URL) */}
              <img src={src} alt={`Vorschau Seite ${i + 1}`} className="h-auto w-full rounded-lg ring-1 ring-line" />
            </li>
          ))}
        </ul>
        <div className="cta-row mt-6">
          <button type="button" data-action="publish" onClick={() => publish(file, week)} className={buttonClasses("red", "lg")}>
            Veröffentlichen
          </button>
          <button type="button" data-action="discard" onClick={discard} className={buttonClasses("soft", "lg")}>
            Abbrechen
          </button>
        </div>
      </div>
    );
  }

  const busy = phase.name === "working";
  return (
    <div className="rounded-[1.75rem] bg-white p-6 md:p-8">
      <label className={`${buttonClasses("red", "lg")} cursor-pointer ${busy ? "pointer-events-none opacity-60" : ""}`}>
        <FileUp className="size-5" aria-hidden />
        PDF auswählen
        <input type="file" accept="application/pdf,.pdf" className="sr-only" disabled={busy} onChange={(e) => choose(e.target.files?.[0])} />
      </label>
      <p className="mt-3 text-[0.9375rem] text-muted">Den Wochenprospekt als PDF – bis 60 MB, höchstens 80 Seiten.</p>

      {"week" in phase && (
        <div className="mt-6 grid gap-4">
          <p className="font-semibold break-all">{phase.file.name}</p>
          <label className="font-semibold">
            Woche
            <select
              data-upload-week
              disabled={busy || locked}
              value={phase.week.weekStart}
              onChange={(e) => {
                const week = [phase.week, ...choices].find((w) => w.weekStart === e.target.value) ?? phase.week;
                setPhase({ ...phase, week } as Phase);
              }}
              className="mt-2 block h-13 w-full rounded-2xl bg-soft px-4 font-semibold"
            >
              {[...new Map([phase.week, ...choices].map((w) => [w.weekStart, w])).values()].map((w) => (
                <option key={w.weekStart} value={w.weekStart}>
                  KW {w.kw} · {w.range}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {phase.name === "working" && (
        <div className="mt-6" aria-live="polite">
          <p className="font-semibold">
            Seite {Math.min(phase.done + 1, phase.total)} von {phase.total} wird vorbereitet …
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-soft" role="progressbar" aria-valuemin={0} aria-valuemax={phase.total} aria-valuenow={phase.done} aria-label="Fortschritt">
            <div className="h-full rounded-full bg-red transition-[width] duration-300" style={{ width: `${(phase.done / phase.total) * 100}%` }} />
          </div>
        </div>
      )}

      {phase.name === "failed" && (
        <p role="alert" className="mt-6 rounded-2xl bg-red-tint px-4 py-3 font-semibold text-red-deep">
          {phase.message}
        </p>
      )}

      {phase.name === "ready" && (
        <button type="button" data-action="upload" onClick={() => run(phase.file, phase.week)} className={`${buttonClasses("ink", "lg")} mt-6`}>
          Hochladen
        </button>
      )}
      {phase.name === "failed" && phase.resumable && (
        <button type="button" data-action="retry" onClick={() => run(phase.file, phase.week)} className={`${buttonClasses("ink", "lg")} mt-4`}>
          <RotateCcw className="size-5" aria-hidden /> Erneut versuchen
        </button>
      )}
    </div>
  );
}
