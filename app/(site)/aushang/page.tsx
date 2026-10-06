import type { Metadata } from "next";
import QRCode from "qrcode";
import { LogoMark } from "@/components/brand/logo";
import { FACE_COLORS, FaceIcon } from "@/components/feedback/face-icon";
import { PrintButton } from "@/components/ui/print-button";
import { markt } from "@/content/markt";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Aushang mit QR-Codes",
  robots: { index: false, follow: false },
};

/** QR-Code als SVG-Markup (beim Build erzeugt, keine Drittanbieter). */
const qr = (url: string) => QRCode.toString(url, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#121212", light: "#0000" } });

/**
 * Druckvorlage für den Markt (A4 hoch): QR-Codes zu Prospekt, Bewerbung, Kalender und Instagram.
 * Die Adressen folgen SITE_URL – nach dem Domainwechsel neu drucken.
 */
export default async function AushangPage() {
  const tiles = [
    { title: "Prospekt der Woche", text: "Alle Angebote – jede Woche neu.", url: absoluteUrl("/angebote") },
    { title: "Bewirb dich in 60 Sekunden", text: "Kein Anschreiben, Lebenslauf optional.", url: absoluteUrl("/karriere/bewerben") },
    { title: "Feiertage im Kalender", text: "Prospekt-Erinnerung und Feiertage aufs Handy.", url: absoluteUrl("/angebote#kalender") },
    { title: "Folge uns auf Instagram", text: `@${markt.instagramHandle}`, url: markt.links.instagram },
  ];
  const codes = await Promise.all(tiles.map((t) => qr(t.url)));
  const feedbackUrl = absoluteUrl("/feedback");
  const feedbackCode = await qr(feedbackUrl);

  return (
    <div className="aushang-wrap bg-soft py-10 print:bg-white print:p-0">
      <div className="wrap mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-h3">Aushang für den Markt</h1>
          <p className="text-muted">
            Zwei Seiten DIN A4 hochkant (auch A3): QR-Codes für Eingang oder Pausenraum und das Feedback-Plakat für Kasse und Ausgang.
          </p>
        </div>
        <PrintButton />
      </div>

      <article className="aushang mx-auto aspect-[210/297] w-[min(210mm,calc(100vw-2rem))] overflow-hidden bg-white p-[8%] shadow-[var(--shadow-lift)] print:w-full print:shadow-none">
        <header className="flex items-center gap-4">
          <LogoMark height={44} />
          <div className="leading-tight">
            <p className="font-display text-[1.6rem] font-extrabold">Rödelheim</p>
            <p className="text-muted">{markt.address.street}</p>
          </div>
        </header>
        <h2 className="mt-[5%] font-display text-[clamp(1.75rem,5vw,3rem)] leading-[0.95] font-extrabold tracking-[-0.03em]">
          Dein Markt auch <span className="text-red">auf dem Handy.</span>
        </h2>
        <ul className="mt-[5%] grid grid-cols-2 gap-[3.5%]">
          {tiles.map((t, i) => (
            <li key={t.title} className="rounded-2xl border-2 border-ink/10 p-[6%]">
              <div className="mx-auto aspect-square w-[78%] [&_svg]:h-full [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: codes[i] }} />
              <p className="mt-3 font-display text-[clamp(0.95rem,2.2vw,1.25rem)] leading-tight font-extrabold">{t.title}</p>
              <p className="mt-1 text-[clamp(0.75rem,1.6vw,0.9375rem)] text-muted">{t.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-[4%] text-[clamp(0.75rem,1.7vw,1rem)] font-semibold">
          Montag – Samstag 7 – 22 Uhr · Telefon {markt.phone.display}
        </p>
      </article>

      <article className="aushang mx-auto mt-10 aspect-[210/297] w-[min(210mm,calc(100vw-2rem))] overflow-hidden bg-white p-[8%] shadow-[var(--shadow-lift)] print:mt-0 print:w-full print:break-before-page print:shadow-none">
        <header className="flex items-center gap-4">
          <LogoMark height={44} />
          <div className="leading-tight">
            <p className="font-display text-[1.6rem] font-extrabold">Rödelheim</p>
            <p className="text-muted">{markt.address.street}</p>
          </div>
        </header>
        <h2 className="mt-[8%] font-display text-[clamp(2.25rem,8vw,4.5rem)] leading-[0.92] font-extrabold tracking-[-0.035em]">
          Wie war dein <span className="text-red">Einkauf?</span>
        </h2>
        <p className="mt-[3%] text-[clamp(1rem,2.6vw,1.5rem)] font-semibold">Ein Tipp genügt – anonym und in 10 Sekunden.</p>
        <ul aria-hidden="true" className="mt-[6%] grid grid-cols-5 gap-[3%]">
          {[1, 2, 3, 4, 5].map((n) => (
            <li key={n} style={{ color: FACE_COLORS[n - 1] }}>
              <FaceIcon n={n} className="w-full" />
            </li>
          ))}
        </ul>
        <div className="mx-auto mt-[7%] aspect-square w-[44%] [&_svg]:h-full [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: feedbackCode }} />
        <p className="mt-[3%] text-center text-[clamp(0.8rem,2vw,1.05rem)] font-semibold">{feedbackUrl.replace(/^https?:\/\//, "")}</p>
        <p className="mt-[2%] text-center text-[clamp(0.75rem,1.8vw,1rem)] text-muted">
          Türkçe · <span lang="ar" dir="rtl">العربية</span> · <span lang="ru">Русский</span> · <span lang="en">English</span>
        </p>
      </article>
    </div>
  );
}
