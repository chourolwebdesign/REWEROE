"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { usePrefs } from "@/lib/store/prefs";
import { useUi } from "@/lib/store/ui";
import { Switch } from "@/components/ui/switch";
import { Cta } from "@/components/brand/cta";

export function CookieSettingsButton({ label }: { label: string }) {
  const setCookieOpen = useUi((s) => s.setCookieOpen);
  return <button type="button" onClick={() => setCookieOpen(true)} className="text-sm text-cream/80 transition-colors hover:text-rewe">{label}</button>;
}

export function CookieConsent() {
  const t = useTranslations("cookies");
  const consent = usePrefs((s) => s.consent);
  const setConsent = usePrefs((s) => s.setConsent);
  const { cookieOpen, setCookieOpen } = useUi();
  const [mounted, setMounted] = useState(false);
  const [detail, setDetail] = useState(false);
  const [stats, setStats] = useState(consent.statistics);
  const [mkt, setMkt] = useState(consent.marketing);

  useEffect(() => setMounted(true), []);
  useEffect(() => { setStats(consent.statistics); setMkt(consent.marketing); }, [consent]);

  const open = mounted && (consent.decidedAt === null || cookieOpen);
  const close = () => { setCookieOpen(false); setDetail(false); };

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-title"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="fixed bottom-4 left-4 right-4 z-[70] max-w-md rounded-[14px] border border-gold/40 bg-card p-6 shadow-lift sm:right-auto"
        >
          <p className="eyebrow mb-2">DSGVO</p>
          <h2 id="cookie-title" className="text-xl">{t("title")}</h2>
          <p className="mt-2 text-sm text-ink-muted">{t("text")}</p>

          {detail && (
            <ul className="mt-4 space-y-3 border-t border-line pt-4">
              <Row title={t("necessary")} text={t("necessaryText")} checked disabled />
              <Row title={t("statistics")} text={t("statisticsText")} checked={stats} onChange={setStats} />
              <Row title={t("marketing")} text={t("marketingText")} checked={mkt} onChange={setMkt} />
            </ul>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <Cta size="sm" onClick={() => { setConsent({ statistics: true, marketing: true }); close(); }}>{t("acceptAll")}</Cta>
            {detail ? (
              <Cta size="sm" variant="secondary" arrow={false} onClick={() => { setConsent({ statistics: stats, marketing: mkt }); close(); }}>{t("acceptSelected")}</Cta>
            ) : (
              <Cta size="sm" variant="secondary" arrow={false} onClick={() => { setConsent({ statistics: false, marketing: false }); close(); }}>{t("onlyNecessary")}</Cta>
            )}
            <button type="button" onClick={() => setDetail((d) => !d)} className="mono ml-auto text-[11px] uppercase tracking-widest text-ink-muted underline-offset-4 hover:underline">{t("settings")}</button>
          </div>
          <Link href="/datenschutz" className="mono mt-3 inline-block text-[11px] uppercase tracking-widest text-ink-muted underline-offset-4 hover:underline">{t("privacy")}</Link>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function Row({ title, text, checked, onChange, disabled }: { title: string; text: string; checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) {
  return (
    <li className="flex items-start justify-between gap-4">
      <div><p className="text-sm font-medium">{title}</p><p className="text-xs text-ink-muted">{text}</p></div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} aria-label={title} />
    </li>
  );
}
