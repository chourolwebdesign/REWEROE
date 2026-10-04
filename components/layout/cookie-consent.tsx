"use client";
import { useState } from "react";
import { useMounted } from "@/lib/hooks";
import { useTranslations } from "next-intl";
import { AnimatePresence, m } from "framer-motion";
import { usePrefs } from "@/lib/store/prefs";
import { useUi } from "@/lib/store/ui";
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

/** Consent card (§4.29): paper card with a 2 px ink frame, radius 0, opacity + y entrance, no spring. */
export function CookieConsent() {
  const t = useTranslations("cookies");
  const consent = usePrefs((s) => s.consent);
  const setConsent = usePrefs((s) => s.setConsent);
  const { cookieOpen, setCookieOpen } = useUi();
  const mounted = useMounted();
  const [detail, setDetail] = useState(false);
  const [local, setLocal] = useState<{ statistics: boolean; marketing: boolean } | null>(null);
  const stats = local?.statistics ?? consent.statistics;
  const mkt = local?.marketing ?? consent.marketing;
  const setStats = (v: boolean) => setLocal({ statistics: v, marketing: mkt });
  const setMkt = (v: boolean) => setLocal({ statistics: stats, marketing: v });

  const open = mounted && (consent.decidedAt === null || cookieOpen);
  const close = () => { setCookieOpen(false); setDetail(false); setLocal(null); };

  return (
    <AnimatePresence>
      {open && (
        <m.aside
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-title"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.24, ease: EASE }}
          className="fixed bottom-4 left-4 right-4 z-[70] max-h-[max(40vh,22rem)] max-w-md overflow-y-auto border border-line-strong bg-card p-6 text-ink shadow-pop sm:right-auto"
        >
          <p className="eyebrow mb-2">{t("eyebrow")}</p>
          <h2 id="cookie-title" className="font-sans text-lg font-semibold leading-snug tracking-normal text-ink">{t("title")}</h2>
          <p className="mt-2 text-sm text-ink-muted">{t("text")}</p>

          {detail && (
            <ul className="mt-4 divide-y divide-line border-t border-line">
              <Row title={t("necessary")} text={t("necessaryText")} checked disabled />
              <Row title={t("statistics")} text={t("statisticsText")} checked={stats} onChange={setStats} />
              <Row title={t("marketing")} text={t("marketingText")} checked={mkt} onChange={setMkt} />
            </ul>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Cta size="md" arrow={false} onClick={() => { setConsent({ statistics: true, marketing: true }); close(); }}>{t("acceptAll")}</Cta>
            {detail ? (
              <Cta size="md" variant="secondary" arrow={false} onClick={() => { setConsent({ statistics: stats, marketing: mkt }); close(); }}>{t("acceptSelected")}</Cta>
            ) : (
              <Cta size="md" variant="secondary" arrow={false} onClick={() => { setConsent({ statistics: false, marketing: false }); close(); }}>{t("onlyNecessary")}</Cta>
            )}
            <Cta size="md" variant="ghost" arrow={false} className="ml-auto px-2" onClick={() => setDetail((d) => !d)} aria-expanded={detail}>{t("settings")}</Cta>
          </div>
          <Cta href="/datenschutz" variant="link" size="sm" arrow={false} className="mt-1 text-[12px] font-medium">{t("privacy")}</Cta>
        </m.aside>
      )}
    </AnimatePresence>
  );
}

function Row({ title, text, checked, onChange, disabled }: { title: string; text: string; checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) {
  return (
    <li className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="text-xs text-ink-muted">{text}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} aria-label={title} className="mt-0.5" />
    </li>
  );
}
