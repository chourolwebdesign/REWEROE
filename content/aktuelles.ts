import type { MediaKey } from "@/lib/media";

/**
 * Beiträge unter /aktuelles – nur echte Ereignisse mit Quelle. Neueste zuerst.
 * `body` ist Markdown (##, ###, >, -, **fett**, [Link](url)), siehe lib/markdown.tsx.
 */
export interface Post {
  slug: string;
  title: string;
  /** ISO-Datum des Ereignisses */
  date: string;
  excerpt: string;
  cover: MediaKey;
  gallery: MediaKey[];
  body: string;
  source?: { title: string; url: string };
}

export const posts: Post[] = [
  {
    slug: "resilienzwoche-2026",
    title: "Resilienzwoche 2026: Vorsorge beginnt im Einkaufswagen",
    date: "2026-09-10",
    excerpt:
      "Innenminister Roman Poseck war bei uns im Markt und hat seinen Notfallbeutel gepackt. Gemeinsam mit Land Hessen, Handelsverband und Feuerwehr haben wir gezeigt, wie ein Vorrat für zehn Tage aussieht.",
    cover: "resilienzwoche-rundgang-2",
    gallery: [
      "resilienzwoche-gruppenbild",
      "resilienzwoche-rundgang-1",
      "resilienzwoche-aktion",
      "resilienzwoche-wagen",
      "resilienzwoche-stand",
      "resilienzwoche-broschueren",
      "resilienzwoche-nina",
      "resilienzwoche-obst",
    ],
    source: {
      title: "Pressemitteilung des Hessischen Ministeriums des Innern, für Sicherheit und Heimatschutz",
      url: "https://hessen.de/presse/minister-wirbt-im-supermarkt-fuer-den-persoenlichen-notvorrat",
    },
    body: `Im September 2026 war unser Markt Schauplatz eines Aktionstags der hessischen **Resilienzwoche**. Heimatschutzminister Roman Poseck kam nach Rödelheim und packte bei uns im Markt seinen eigenen Notfallbeutel.

Hintergrund ist eine Kooperation des Innenministeriums mit dem Handelsverband Hessen: In 21 ausgewählten REWE-Märkten in 17 Landkreisen wurde ein beispielhafter Notvorrat für eine Person und zehn Tage aufgebaut – nach den Empfehlungen des Bundesamts für Bevölkerungsschutz und Katastrophenhilfe (BBK). Kundinnen und Kunden konnten die BBK-Broschüre „Vorsorgen für Krisen und Katastrophen“ mit Checkliste und einen Notfallbeutel kostenlos mitnehmen.

> „Ein Staat ist nur so resilient wie seine Bürger.“
> – Roman Poseck, Hessischer Minister des Innern, für Sicherheit und Heimatschutz

Der Minister dankte dem Handelsverband Hessen, REWE und Marktleiter Ali Alamyaar für den Aktionstag. Wir haben uns sehr gefreut, dabei zu sein – und danken der Feuerwehr Frankfurt und allen Gästen, die mit uns durch den Markt gegangen sind.

## Was in den Vorrat gehört

Das BBK empfiehlt einen Vorrat für etwa zehn Tage. Als Richtwert pro Person:

- **Getränke:** rund 20 Liter – 2 Liter pro Tag, davon 0,5 Liter zum Kochen
- **Getreideprodukte, Brot, Kartoffeln, Nudeln, Reis:** etwa 3,5 kg
- **Gemüse und Hülsenfrüchte:** etwa 4 kg
- **Obst und Nüsse:** etwa 2,5 kg
- **Milch und Milchprodukte:** etwa 2,6 kg
- **Fisch, Fleisch, Eier:** etwa 1,5 kg
- **Fette und Öle:** rund 0,36 kg

Am besten nur einlagern, was ohnehin gegessen wird – und den Vorrat regelmäßig verbrauchen und wieder auffüllen.

## Mehr als Lebensmittel

- **Licht:** Taschenlampe und Ersatzbatterien – für den Minister das Wichtigste im Notvorrat.
- **Hausapotheke:** Verbandskasten und die wichtigsten persönlichen Medikamente.
- **Hygiene, Bargeld und Dokumente:** griffbereit an einem Ort.
- **Warn-App NINA:** Die kostenlose Warn-App des BBK informiert über Gefahren in deiner Umgebung.

Den Ratgeber „Vorsorgen für Krisen und Katastrophen“ mit Checkliste gibt es kostenlos beim [Bundesamt für Bevölkerungsschutz und Katastrophenhilfe](https://www.bbk.bund.de/).`,
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug) ?? null;
