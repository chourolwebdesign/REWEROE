import { SectionHeading } from "@/components/ui/section-heading";
import { markt } from "@/content/markt";
import { cn } from "@/lib/utils";

/**
 * „Auf einen Blick“: große Zahlen, alle aus den Stammdaten in content/markt.ts abgeleitet – nichts erfunden.
 */
function facts() {
  const open = Object.values(markt.hours.regular).filter((h): h is [string, string] => Array.isArray(h));
  const days = open.length;
  const first = open[0];
  const hours = first ? parseInt(first[1], 10) - parseInt(first[0], 10) : 0;
  const from = first ? parseInt(first[0], 10) : 0;
  const to = first ? parseInt(first[1], 10) : 0;
  const m = markt.address.street.match(/^(.*) (\S+)$/);
  const [street, houseNo] = m ? [m[1], m[2]] : [markt.address.street, ""];
  return [
    { value: String(days), unit: "Tage", label: "die Woche für dich geöffnet – Montag bis Samstag.", small: false },
    { value: String(hours), unit: "Std.", label: "täglich da, von " + from + " bis " + to + "\u00a0Uhr.", small: false },
    { value: String(markt.services.length), unit: "Extras", label: "direkt im Markt: " + markt.services.map((s) => s.name).join(" und ") + ".", small: false },
    {
      value: markt.address.zip,
      unit: "",
      label: (
        <>
          {/* umbrechen darf nur vor der Hausnummer, nie in „18–22“ */}
          mitten in {markt.address.district}, {street} <span className="whitespace-nowrap">{houseNo}</span>.
        </>
      ),
      small: true,
    },
  ];
}

export function NumbersBand({ className }: { className?: string }) {
  return (
    <section aria-labelledby="zahlen-titel" className={cn("wrap", className)}>
      <SectionHeading id="zahlen-titel" eyebrow="Auf einen Blick" title="Dein Markt in Zahlen." />
      <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-stage)] bg-line ring-1 ring-line lg:grid-cols-4">
        {facts().map((f) => (
          <div key={f.value + f.unit} className="reveal flex flex-col justify-between gap-5 bg-soft p-6 md:gap-8 md:p-9">
            <dt className="order-2 max-w-[24ch] text-[0.9375rem] leading-snug text-muted md:text-base">{f.label}</dt>
            <dd className="order-1 flex items-start gap-2 font-display leading-[0.85] font-extrabold tracking-[-0.05em] text-red">
              <span className={cn("tabular-nums", f.small ? "text-[clamp(2.25rem,1.3rem+3vw,4.25rem)]" : "text-[clamp(3.75rem,2rem+6vw,7.5rem)]")}>
                {f.value}
              </span>
              {f.unit && <span className="mt-[0.2em] text-[clamp(1rem,0.8rem+0.8vw,1.5rem)] tracking-[-0.02em] text-ink">{f.unit}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
