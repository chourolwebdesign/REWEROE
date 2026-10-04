"use client";
import { useCallback, useId, useRef, useState } from "react";
import { useMounted } from "@/lib/hooks";
import { useTranslations } from "next-intl";
import { AnimatePresence, m } from "framer-motion";
import { usePrefs } from "@/lib/store/prefs";
import { useUi } from "@/lib/store/ui";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Cta } from "@/components/brand/cta";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Footer link that re-opens the consent card. Styled like the footer links (tokens flip inside `.on-block`). */
export function CookieSettingsButton({ label }: { label: string }) {
  const setCookieOpen = useUi((s) => s.setCookieOpen);
  return (
    <button type="button" onClick={() => setCookieOpen(true)} className="inline-flex min-h-11 items-center text-sm text-block-ink/90 underline-offset-4 transition-colors duration-[var(--dur-ui)] hover:text-block-ink hover:underline">
      {label}
    </button>
  );
}

/** md buttons from `sm` up; 44 px on phones where the card is a compact bottom sheet. */
const btn = "sm:h-12 sm:px-5 sm:text-[15px]";

/**
 * Consent card (§4.29): paper card with a 2 px ink frame, radius 0, opacity + y entrance, no spring.
 * Below `sm` it is a compact bottom sheet (≤ 32 vh: title, one line, buttons) so it never covers the hero CTA.
 * Non-modal, but it takes focus when it opens (WCAG 2.4.11) and Escape on first open = „Nur notwendige".
 */
export function CookieConsent() {
  const t = useTranslations("cookies");
  const consent = usePrefs((s) => s.consent);
  const setConsent = usePrefs((s) => s.setConsent);
  const { cookieOpen, setCookieOpen } = useUi();
  const mounted = useMounted();
  const [detail, setDetail] = useState(false);
  const [local, setLocal] = useState<{ statistics: boolean; marketing: boolean } | null>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const stats = local?.statistics ?? consent.statistics;
  const mkt = local?.marketing ?? consent.marketing;
  const setStats = (v: boolean) => setLocal({ statistics: v, marketing: mkt });
  const setMkt = (v: boolean) => setLocal({ statistics: stats, marketing: v });

  const firstOpen = consent.decidedAt === null;
  const open = mounted && (firstOpen || cookieOpen);
  const close = () => {
    setCookieOpen(false); setDetail(false); setLocal(null);
    const el = returnTo.current;
    if (el && el !== document.body && document.contains(el)) el.focus();
  };
  const decide = (c: { statistics: boolean; marketing: boolean }) => { setConsent(c); close(); };

  // Stable callback ref: runs once on mount (an inline arrow would re-run — and re-focus — on every render).
  const focusOnMount = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    el.focus({ preventScroll: true });
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <m.aside
          ref={focusOnMount}
          tabIndex={-1}
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-title"
          aria-describedby="cookie-text"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.24, ease: EASE }}
          onKeyDown={(e) => {
            if (e.key !== "Escape") return;
            e.stopPropagation();
            if (firstOpen) decide({ statistics: false, marketing: false }); else close();
          }}
          className={cn(
            "fixed inset-x-0 bottom-0 z-[70] overflow-y-auto border-t border-line-strong bg-card p-4 text-ink shadow-pop outline-none",
            detail ? "max-h-[75vh]" : "max-h-[32vh]",
            "sm:bottom-4 sm:left-4 sm:right-auto sm:max-h-[max(40vh,22rem)] sm:max-w-md sm:border sm:p-6",
          )}
        >
          <p className="eyebrow mb-2 hidden sm:block">{t("eyebrow")}</p>
          <h2 id="cookie-title" className="font-sans text-base font-semibold leading-snug tracking-normal text-ink sm:text-lg">{t("title")}</h2>
          <p id="cookie-text" className="mt-1 text-sm text-ink-muted sm:mt-2">
            <span className="sm:hidden">{t("textShort")}</span>
            <span className="hidden sm:inline">{t("text")}</span>
          </p>

          {detail && (
            <ul className="mt-3 divide-y divide-line border-t border-line sm:mt-4">
              <Row title={t("necessary")} text={t("necessaryText")} checked disabled />
              <Row title={t("statistics")} text={t("statisticsText")} checked={stats} onChange={setStats} />
              <Row title={t("marketing")} text={t("marketingText")} checked={mkt} onChange={setMkt} />
            </ul>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-5">
            <Cta size="sm" arrow={false} className={cn(btn, "flex-1 sm:flex-none")} onClick={() => decide({ statistics: true, marketing: true })}>{t("acceptAll")}</Cta>
            {detail ? (
              <Cta size="sm" variant="secondary" arrow={false} className={cn(btn, "flex-1 sm:flex-none")} onClick={() => decide({ statistics: stats, marketing: mkt })}>{t("acceptSelected")}</Cta>
            ) : (
              <Cta size="sm" variant="secondary" arrow={false} className={cn(btn, "flex-1 sm:flex-none")} onClick={() => decide({ statistics: false, marketing: false })}>{t("onlyNecessary")}</Cta>
            )}
            <Cta size="sm" variant="ghost" arrow={false} className={cn(btn, "ml-auto px-2 sm:px-2")} onClick={() => setDetail((d) => !d)} aria-expanded={detail}>{t("settings")}</Cta>
            <Cta href="/datenschutz" variant="link" size="sm" arrow={false} className="text-[12px] font-medium sm:basis-full">{t("privacy")}</Cta>
          </div>
        </m.aside>
      )}
    </AnimatePresence>
  );
}

/** One consent row: the whole row is the switch's label (44 px hit area); name + description via aria ids. */
function Row({ title, text, checked, onChange, disabled }: { title: string; text: string; checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) {
  const id = useId();
  return (
    <li>
      <label className={cn("flex min-h-11 items-start justify-between gap-4 py-3", disabled ? "cursor-default" : "cursor-pointer")}>
        <span>
          <span id={`${id}-title`} className="block text-sm font-medium text-ink">{title}</span>
          <span id={`${id}-text`} className="block text-xs text-ink-muted">{text}</span>
        </span>
        <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} aria-labelledby={`${id}-title`} aria-describedby={`${id}-text`} className="mt-0.5" />
      </label>
    </li>
  );
}
