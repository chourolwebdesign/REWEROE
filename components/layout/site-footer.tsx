import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPrimaryStore, getSettings } from "@/lib/content";
import { tx } from "@/lib/l10n";
import { Logo } from "@/components/brand/logo";
import { NewsletterForm } from "@/components/home/newsletter";
import { CookieSettingsButton } from "./cookie-consent";
import { FooterHours } from "./footer-hours";

const brandLinks = [
  { key: "about", href: "/ueber-uns" }, { key: "sustainability", href: "/nachhaltigkeit" }, { key: "regional", href: "/regional" }, { key: "bio", href: "/bio" },
  { key: "magazine", href: "/magazin" }, { key: "recipes", href: "/rezepte" }, { key: "categories", href: "/kategorien" },
] as const;
const serviceLinks = [
  { key: "stores", href: "/filialen" }, { key: "offers", href: "/angebote" }, { key: "bonus", href: "/bonus" },
  { key: "career", href: "/karriere" }, { key: "contact", href: "/kontakt" }, { key: "account", href: "/konto" },
] as const;
const legalLinks = [
  { key: "impressum", href: "/impressum" }, { key: "datenschutz", href: "/datenschutz" }, { key: "agb", href: "/agb" }, { key: "widerruf", href: "/widerruf" },
] as const;

/** Payment marks are brand names: the one place (besides LangSwitch and `data` chips) that may read in caps. */
const paymentMarks: Record<string, string> = { visa: "VISA", mastercard: "Mastercard", paypal: "PayPal", klarna: "Klarna.", giropay: "giropay" };

const linkCls = "inline-flex min-h-11 items-center text-sm text-block-ink/90 underline-offset-4 transition-colors duration-[var(--dur-ui)] hover:text-block-ink hover:underline";

/** Anthracite footer block (§4.4): brand rule · store facts · link columns · legal row · „Rödelheim" watermark. */
export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const tc = await getTranslations("common");
  const th = await getTranslations("home");
  const locale = await getLocale();
  const s = getSettings();
  const store = getPrimaryStore();
  const year = new Date().getFullYear();
  const addressReady = store.address.status === "published" && Boolean(store.address.street);

  return (
    <footer className="on-block brand-rule mt-32" role="contentinfo">
      {/* Row 1 — brand · store facts · newsletter */}
      <div className="container-x grid grid-cols-4 gap-x-6 gap-y-10 py-16 md:grid-cols-12 md:py-20">
        <div className="col-span-4">
          <Logo size="footer" merchant={s.brand.district} logoSrc={s.brand.logo} />
          <p className="display mt-6 text-[clamp(1.5rem,2vw,1.875rem)] leading-tight text-block-ink">{t("claim")}</p>
          <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-block-muted">{tx(s.brand.premiumClaim, locale)}</p>
        </div>

        <dl className="col-span-4 self-start divide-y divide-block-line text-sm">
          <div className="flex justify-between gap-6 py-2.5">
            <dt className="shrink-0 text-block-muted">{t("address")}</dt>
            <dd className="text-right text-block-ink">
              {addressReady ? (
                <>
                  {store.address.street}
                  <br />
                  <span className="num">{store.address.zip}</span> {store.address.city}
                </>
              ) : (
                <span className="text-block-muted">{t("addressPending")}</span>
              )}
            </dd>
          </div>
          <FooterHours hours={store.hours} hoursStatus={store.hoursStatus} />
          <div className="flex justify-between gap-6 py-2.5">
            <dt className="shrink-0 text-block-muted">{t("phone")}</dt>
            <dd className="text-right">
              {store.phone ? (
                <a href={`tel:${store.phone.replace(/\s+/g, "")}`} className="num -my-2.5 inline-flex min-h-11 items-center text-block-ink underline-offset-4 hover:underline">{store.phone}</a>
              ) : (
                <span className="text-block-muted">{t("phonePending")}</span>
              )}
            </dd>
          </div>
          <div className="flex justify-between gap-6 py-2.5">
            <dt className="shrink-0 text-block-muted">{t("services")}</dt>
            <dd className="flex flex-wrap justify-end gap-1.5">
              {store.services.map((sv) => (
                <span key={sv} className="rounded-[2px] border border-block-line px-2 py-0.5 text-[12px] text-block-muted">{tc(`services.${sv}`)}</span>
              ))}
            </dd>
          </div>
        </dl>

        <div className="col-span-4">
          <p className="eyebrow">{th("newsletterEyebrow")}</p>
          <p className="display mt-3 text-xl text-block-ink">{th("newsletterTitle")}</p>
          <div className="mt-5">
            <NewsletterForm variant="block" />
          </div>
        </div>
      </div>

      <div className="container-x">
        {/* Row 2 — link columns */}
        <div className="grid grid-cols-2 gap-y-8 border-t border-block-line py-12 md:grid-cols-4 md:divide-x md:divide-block-line">
          <FooterCol title={t("brand")}>{brandLinks.map((l) => <FooterLink key={l.key} href={l.href}>{tn(l.key)}</FooterLink>)}</FooterCol>
          <FooterCol title={t("service")}>{serviceLinks.map((l) => <FooterLink key={l.key} href={l.href}>{tn(l.key)}</FooterLink>)}</FooterCol>
          <FooterCol title={t("legal")}>
            {legalLinks.map((l) => <FooterLink key={l.key} href={l.href}>{t(l.key)}</FooterLink>)}
            <li><CookieSettingsButton label={t("cookieSettings")} /></li>
          </FooterCol>
          <FooterCol title={t("follow")}>
            {s.social.map((so) => (
              <li key={so.id}><a href={so.url} className={linkCls} rel="noopener noreferrer">{so.label}</a></li>
            ))}
          </FooterCol>
        </div>

        {/* Row 3 — legal */}
        <div className="flex flex-col gap-4 border-t border-block-line py-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t("payments")}>
            <span className="mr-1 text-[12px] font-medium text-block-muted">{t("payments")}</span>
            {s.payments.map((p) => (
              <span key={p} className="data rounded-[2px] border border-block-line px-2 py-1 text-block-muted">{paymentMarks[p] ?? p}</span>
            ))}
          </div>
          <p className="text-[12px] font-medium text-block-muted">{t("copyright", { year })}</p>
        </div>
      </div>

      {/* Watermark — the district, never the wordmark */}
      <div className="container-x overflow-hidden" aria-hidden>
        <div className="footer-watermark -mb-[0.18em] select-none text-[clamp(4rem,19vw,19rem)] leading-[0.8]" data-text="Rödelheim" />
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="md:px-6 md:first:pl-0">
      <h2 className="eyebrow mb-3">{title}</h2>
      <ul className="flex flex-col">{children}</ul>
    </div>
  );
}
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <li><Link href={href} className={linkCls}>{children}</Link></li>;
}
