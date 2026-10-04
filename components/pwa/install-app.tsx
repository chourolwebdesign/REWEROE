"use client";

import { Plus, Share, SquarePlus, X } from "lucide-react";
import { useRef, useSyncExternalStore } from "react";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Das Install-Ereignis kann vor React kommen – deshalb modulweit mitschreiben.
let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    notify();
  });
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

type Mode = "hidden" | "prompt" | "ios";
function getMode(): Mode {
  if (window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone) return "hidden";
  if (deferred) return "prompt";
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
  return ios ? "ios" : "hidden";
}

/**
 * „Als App installieren“: Android/Chrome zeigen den echten Installationsdialog, iPhone/iPad eine kurze Anleitung.
 * Unsichtbar, wenn die Website schon als App läuft oder der Browser keine Installation kennt.
 */
export function InstallApp({
  variant = "glass",
  size = "md",
  className,
  label = "Als App installieren",
}: {
  variant?: "ink" | "white" | "soft" | "glass" | "red" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}) {
  const mode = useSyncExternalStore(subscribe, getMode, () => "hidden" as Mode);
  const dialogRef = useRef<HTMLDialogElement>(null);
  if (mode === "hidden") return null;

  const onClick = async () => {
    if (mode === "ios") {
      dialogRef.current?.showModal();
      return;
    }
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => null);
    deferred = null;
    notify();
  };

  return (
    <>
      <button type="button" onClick={onClick} className={cn(buttonClasses(variant, size), className)}>
        <SquarePlus className="size-[1.1em]" aria-hidden />
        {label}
      </button>
      {mode === "ios" && (
        <dialog
          ref={dialogRef}
          aria-labelledby="ios-install-title"
          className="dialog-pop m-auto w-[min(26rem,calc(100vw-2rem))] rounded-[1.75rem] bg-white p-0 text-ink shadow-[0_30px_80px_rgb(0_0_0/.3)] backdrop:bg-black/60"
          onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}
        >
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 id="ios-install-title" className="text-h3">
                Auf den Home-Bildschirm
              </h2>
              <button type="button" onClick={() => dialogRef.current?.close()} className="-mt-1 -mr-2 grid size-11 place-items-center rounded-full hover:bg-soft" aria-label="Schließen">
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <ol className="mt-5 grid gap-4">
              <li className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-soft">
                  <Share className="size-5" aria-hidden />
                </span>
                <span>
                  Unten in Safari auf <strong>Teilen</strong> tippen.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-soft">
                  <Plus className="size-5" aria-hidden />
                </span>
                <span>
                  <strong>Zum Home-Bildschirm</strong> wählen.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-red text-[0.8125rem] font-bold text-white">REWE</span>
                <span>
                  Auf <strong>Hinzufügen</strong> tippen – fertig.
                </span>
              </li>
            </ol>
          </div>
        </dialog>
      )}
    </>
  );
}
