import "server-only";
import nodemailer from "nodemailer";

/**
 * E-Mail-Versand für das Bewerbungsformular. Welcher Weg genutzt wird, entscheidet die Umgebung:
 * - SMTP (eigenes Postfach des Markts): SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 * - Resend (API): RESEND_API_KEY
 * - MAIL_DRY_RUN=true: nichts senden, nur protokollieren (lokal/Test)
 * Absender immer MAIL_FROM. Ohne Konfiguration wirft sendMail MailNotConfiguredError.
 */
export interface Attachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export interface Mail {
  to: string[];
  subject: string;
  text: string;
  replyTo?: string;
  attachments?: Attachment[];
}

export class MailNotConfiguredError extends Error {
  constructor() {
    super("E-Mail-Versand ist nicht konfiguriert");
  }
}

export type MailTransport = "smtp" | "resend" | "dry-run" | "none";

export function mailTransport(): MailTransport {
  if (process.env.MAIL_DRY_RUN === "true") return "dry-run";
  if (!process.env.MAIL_FROM) return "none";
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) return "smtp";
  if (process.env.RESEND_API_KEY) return "resend";
  return "none";
}

/** Empfänger der Bewerbungen (kommagetrennt in BEWERBUNG_TO). */
export const applicationRecipients = () =>
  (process.env.BEWERBUNG_TO ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export const applicationsReady = () => mailTransport() !== "none" && (mailTransport() === "dry-run" || applicationRecipients().length > 0);

/** Empfänger des Feedback-Alarms bei 1–2 Sternen (kommagetrennt in FEEDBACK_ALARM_AN). */
export const feedbackRecipients = () =>
  (process.env.FEEDBACK_ALARM_AN ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export const feedbackAlarmReady = () => mailTransport() === "dry-run" || (mailTransport() !== "none" && feedbackRecipients().length > 0);

export async function sendMail(mail: Mail): Promise<void> {
  const transport = mailTransport();
  if (transport === "none") throw new MailNotConfiguredError();

  if (transport === "dry-run") {
    // Keine personenbezogenen Daten ins Log: nur Betreff-Länge, Empfängerzahl und Anhänge.
    console.info(`[mail:dry-run] an ${mail.to.length} Empfänger, ${mail.attachments?.length ?? 0} Anhang/Anhänge, ${mail.text.length} Zeichen`);
    return;
  }

  if (transport === "smtp") {
    const port = Number(process.env.SMTP_PORT ?? 465);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
      replyTo: mail.replyTo,
      attachments: mail.attachments?.map((a) => ({ filename: a.filename, content: a.content, contentType: a.contentType })),
    });
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
      reply_to: mail.replyTo,
      attachments: mail.attachments?.map((a) => ({ filename: a.filename, content: a.content.toString("base64") })),
    }),
  });
  if (!res.ok) throw new Error(`Resend antwortet mit ${res.status}`);
}
