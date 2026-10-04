"use server";

import { headers } from "next/headers";
import { AREAS, EMPLOYMENT, UPLOAD } from "@/content/bewerbung";
import { markt } from "@/content/markt";
import { checkFile, formatApplicationText, formatStart, isLikelyBot, parseApplication, safeFilename, type FieldErrors } from "@/lib/application";
import { applicationRecipients, MailNotConfiguredError, sendMail, type Attachment } from "@/lib/mailer";

export type ApplicationState =
  { status: "idle" } | { status: "error"; message: string; errors?: FieldErrors } | { status: "success"; vorname: string };

/** Einfache Begrenzung je Server-Instanz: höchstens 5 Bewerbungen pro Stunde und IP. */
const recentByIp = new Map<string, number[]>();
const HOUR = 3_600_000;

export async function submitApplication(_prev: ApplicationState, fd: FormData): Promise<ApplicationState> {
  const now = new Date();

  // Bots bekommen eine Erfolgsmeldung, aber es wird nichts verschickt.
  if (isLikelyBot({ honeypot: String(fd.get("website") ?? ""), startedAt: Number(fd.get("t")) }, now)) {
    return { status: "success", vorname: "" };
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unbekannt";
  const recent = (recentByIp.get(ip) ?? []).filter((t) => now.getTime() - t < HOUR);
  if (recent.length >= 5) {
    return {
      status: "error",
      message: `Zu viele Bewerbungen in kurzer Zeit. Bitte versuch es später noch einmal oder ruf uns an: ${markt.phone.display}.`,
    };
  }

  const parsed = parseApplication(fd, now);
  const errors: FieldErrors = parsed.ok ? {} : { ...parsed.errors };

  const files = fd.getAll("lebenslauf").filter((f): f is File => typeof f === "object" && f !== null && "arrayBuffer" in f && f.size > 0);
  const attachments: Attachment[] = [];
  if (files.length > UPLOAD.maxFiles) errors.lebenslauf = `Bitte lade höchstens ${UPLOAD.maxFiles} Dateien hoch.`;
  else if (files.reduce((s, f) => s + f.size, 0) > UPLOAD.maxBytes) errors.lebenslauf = "Die Dateien sind zusammen größer als 4 MB.";
  else {
    for (const f of files) {
      const content = Buffer.from(await f.arrayBuffer());
      const check = checkFile(f.name, new Uint8Array(content.subarray(0, 16)));
      if (!check.ok) {
        errors.lebenslauf = check.error;
        break;
      }
      attachments.push({ filename: safeFilename(f.name, check.type), content, contentType: check.type });
    }
  }

  if (!parsed.ok || Object.keys(errors).length) {
    return { status: "error", message: "Bitte prüfe die markierten Angaben.", errors };
  }

  const app = parsed.data;
  const art = EMPLOYMENT.find((e) => e.id === app.art)?.label ?? app.art;
  const bereich = app.bereich.map((b) => AREAS.find((a) => a.id === b)?.label ?? b).join(", ");

  try {
    await sendMail({
      to: applicationRecipients(),
      subject: `Bewerbung: ${app.vorname} ${app.nachname} – ${art} (${bereich})`,
      text: formatApplicationText(
        app,
        attachments.map((a) => ({ name: a.filename, size: a.content.length })),
        now,
      ),
      replyTo: app.email ?? undefined,
      attachments,
    });
    if (app.email && process.env.BEWERBUNG_CONFIRM === "true") {
      await sendMail({
        to: [app.email],
        subject: "Danke für deine Bewerbung bei REWE Rödelheim",
        text: [
          `Hallo ${app.vorname},`,
          "",
          `danke für deine Bewerbung (${art}, Start: ${formatStart(app.start)}). Sie ist bei uns angekommen – wir melden uns bei dir.`,
          "",
          "Viele Grüße",
          `${markt.name}`,
          `${markt.address.street}, ${markt.address.zip} ${markt.address.city}`,
          `Telefon ${markt.phone.display}`,
        ].join("\n"),
      }).catch(() => {});
    }
  } catch (e) {
    if (e instanceof MailNotConfiguredError) {
      return { status: "error", message: `Die Online-Bewerbung wird gerade eingerichtet. Ruf uns gern direkt an: ${markt.phone.display}.` };
    }
    console.error("[bewerbung] Versand fehlgeschlagen:", e instanceof Error ? e.message : "unbekannt");
    return {
      status: "error",
      message: `Das hat leider nicht geklappt. Bitte versuch es gleich noch einmal oder ruf uns an: ${markt.phone.display}.`,
    };
  }

  recent.push(now.getTime());
  recentByIp.set(ip, recent);
  return { status: "success", vorname: app.vorname };
}
