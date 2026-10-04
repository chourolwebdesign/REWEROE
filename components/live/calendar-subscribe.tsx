"use client";

import { CalendarPlus, Copy, Download, Mail, Smartphone } from "lucide-react";
import { useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { menuItemClass, PopoverMenu } from "@/components/ui/popover-menu";
import { cn } from "@/lib/utils";

/**
 * „In meinen Kalender“: abonniert /kalender.ics (Prospekt jede Woche, Feiertage, Termine).
 * Externe Dienste (Google, Outlook) werden erst nach Klick aufgerufen.
 */
export function CalendarSubscribe({
  url,
  variant = "ink",
  size = "md",
  align,
  className,
}: {
  /** absolute https-Adresse von /kalender.ics */
  url: string;
  variant?: "ink" | "white" | "soft" | "glass" | "red";
  size?: "sm" | "md" | "lg";
  align?: "start" | "end";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const webcal = url.replace(/^https?:/, "webcal:");
  const google = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`;
  const outlook = `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(url)}&name=${encodeURIComponent("REWE Rödelheim")}`;

  return (
    <PopoverMenu
      className={className}
      align={align}
      buttonClassName={buttonClasses(variant, size)}
      icon={<CalendarPlus className="size-[1.1em]" aria-hidden />}
      label="In meinen Kalender"
    >
      {(close) => (
        <ul>
          <li>
            <a href={webcal} className={menuItemClass} onClick={close}>
              <Smartphone className="size-5 text-muted" aria-hidden /> iPhone, iPad & Mac
            </a>
          </li>
          <li>
            <a href={google} target="_blank" rel="noopener" className={menuItemClass} onClick={close}>
              <CalendarPlus className="size-5 text-muted" aria-hidden /> Google Kalender
              <span className="sr-only"> (öffnet in neuem Tab)</span>
            </a>
          </li>
          <li>
            <a href={outlook} target="_blank" rel="noopener" className={menuItemClass} onClick={close}>
              <Mail className="size-5 text-muted" aria-hidden /> Outlook
              <span className="sr-only"> (öffnet in neuem Tab)</span>
            </a>
          </li>
          <li>
            <button
              type="button"
              className={menuItemClass}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(url);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 2500);
                } catch {}
              }}
            >
              <Copy className="size-5 text-muted" aria-hidden />
              <span aria-live="polite">{copied ? "Link kopiert" : "Link für andere Kalender kopieren"}</span>
            </button>
          </li>
          <li>
            <a href={url} download="rewe-roedelheim.ics" className={cn(menuItemClass, "text-muted")} onClick={close}>
              <Download className="size-5" aria-hidden /> Als Datei laden (.ics)
            </a>
          </li>
        </ul>
      )}
    </PopoverMenu>
  );
}
