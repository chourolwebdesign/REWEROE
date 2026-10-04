"use client";

import { Copy, MessageCircle, Share2 } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { buttonClasses } from "@/components/ui/button";
import { menuItemClass, PopoverMenu } from "@/components/ui/popover-menu";

const noSubscribe = () => () => {};
const canShare = () => typeof navigator !== "undefined" && typeof navigator.share === "function";

/**
 * Teilen: auf dem Handy das System-Teilen-Menü, sonst WhatsApp-Link oder Link kopieren.
 * WhatsApp wird erst nach Klick aufgerufen.
 */
export function ShareButton({
  url,
  title,
  text,
  label = "Teilen",
  variant = "soft",
  size = "md",
  align,
  className,
}: {
  url: string;
  title: string;
  text: string;
  label?: string;
  variant?: "ink" | "white" | "soft" | "glass" | "red" | "outline";
  size?: "sm" | "md" | "lg";
  align?: "start" | "end";
  className?: string;
}) {
  const native = useSyncExternalStore(noSubscribe, canShare, () => false);
  const [copied, setCopied] = useState(false);
  const icon = <Share2 className="size-[1.05em]" aria-hidden />;

  if (native) {
    return (
      <button
        type="button"
        className={`${buttonClasses(variant, size)} ${className ?? ""}`}
        onClick={() => navigator.share({ title, text, url }).catch(() => {})}
      >
        {icon}
        {label}
      </button>
    );
  }

  return (
    <PopoverMenu className={className} align={align} buttonClassName={buttonClasses(variant, size)} icon={icon} label={label}>
      {(close) => (
        <ul>
          <li>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
              target="_blank"
              rel="noopener"
              className={menuItemClass}
              onClick={close}
            >
              <MessageCircle className="size-5 text-muted" aria-hidden /> Per WhatsApp
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
              <span aria-live="polite">{copied ? "Link kopiert" : "Link kopieren"}</span>
            </button>
          </li>
        </ul>
      )}
    </PopoverMenu>
  );
}
