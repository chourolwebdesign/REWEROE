import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSettings } from "@/lib/content";
import { tx } from "@/lib/l10n";
import { CookieSettingsButton } from "./cookie-consent";

const serviceLinks = [
  { key: "stores", href: "/filialen" }, { key: "offers", href: "/angebote" }, { key: "bonus", href: "/bonus" },
  { key: "career", href: "/karriere" }, { key: "contact", href: "/kontakt" }, { key: "account", href: "/konto" },
] as const;
const brandLinks = [
  { key: "about", href: "/ueber-uns" }, { key: "sustainability", href: "/nachhaltigkeit" }, { key: "magazine", href: "/magazin" }, { key: "recipes", href: "/rezepte" }, { key: "categories", href: "/kategorien" },
] as const;
const legalLinks = [
  { key: "impressum", href: "/impressum" }, { key: "datenschutz", href: "/datenschutz" }, { key: "agb", href: "/agb" }, { key: "widerruf", href: "/widerruf" },
] as const;

const paymentMarks: Record<string, string> = { visa: "VISA", mastercard: "Mastercard", paypal: "PayPal", klarna: "Klarna.", giropay: "giropay" };

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const locale = await getLocale();
  const s = getSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 bg-forest text-cream" role="contentinfo">
      <div className="gold-line absolute inset-x-0 top-0" aria-hidden />
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <div className="max-w-sm">
          <p className="serif text-3xl leading-tight">{tx(s.brand.premiumClaim, locale)}</p>
          <p className="mt-4 text-sm text-cream/70">{t("merchantNote")}</p>
          <p className="mono mt-6 text-[11px] uppercase tracking-[0.18em] text-gold">{s.brand.claim}</p>
        </div>
        <FooterCol title={t("brand")}>{brandLinks.map((l) => <FooterLink key={l.key} href={l.href}>{tn(l.key)}</FooterLink>)}</FooterCol>
        <FooterCol title={t("service")}>{serviceLinks.map((l) => <FooterLink key={l.key} href={l.href}>{tn(l.key)}</FooterLink>)}</FooterCol>
        <FooterCol title={t("legal")}>
          {legalLinks.map((l) => <FooterLink key={l.key} href={l.href}>{t(l.key)}</FooterLink>)}
          <li><CookieSettingsButton label={t("cookieSettings")} /></li>
        </FooterCol>
        <FooterCol title={t("follow")}>
          {s.social.map((so) => (
            <li key={so.id}><a href={so.url} className="text-sm text-cream/80 transition-colors hover:text-rewe" rel="noopener noreferrer">{so.label}</a></li>
          ))}
        </FooterCol>
      </div>

      <div className="container-x flex flex-col gap-6 border-t border-cream/10 py-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2" aria-label={t("payments")}>
          <span className="mono mr-2 text-[10px] uppercase tracking-[0.18em] text-cream/70">{t("payments")}</span>
          {s.payments.map((p) => (
            <span key={p} className="mono rounded-[4px] border border-cream/20 bg-cream/5 px-2 py-1 text-[11px] font-semibold tracking-wide text-cream/90">{paymentMarks[p] ?? p}</span>
          ))}
        </div>
        <p className="mono text-[11px] text-cream/70">{t("copyright", { year })}</p>
      </div>

      <div className="container-x overflow-hidden pb-6" aria-hidden>
        <div className="footer-watermark select-none" data-text="REWE" />
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="eyebrow mb-5 font-sans text-[11px]">{title}</h2>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <li><Link href={href as any} className="text-sm text-cream/80 transition-colors hover:text-rewe">{children}</Link></li>;
}
