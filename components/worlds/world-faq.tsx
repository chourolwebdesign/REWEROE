import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export interface FaqItem { q: string; a: string }

/** FAQ accordion for the Regional/Bio world pages: hairline rows, `display` questions, ink-2 answers. */
export function WorldFaq({ items, idPrefix = "faq", className }: { items: FaqItem[]; idPrefix?: string; className?: string }) {
  return (
    <Accordion type="single" collapsible className={cn("rule-strong", className)}>
      {items.map((f, i) => (
        <AccordionItem key={`${idPrefix}-${i}`} value={`${idPrefix}-${i}`} className="border-line">
          <AccordionTrigger className="display min-h-14 rounded-none py-5 text-left text-lg font-[number:var(--fw-display)] leading-snug text-ink hover:no-underline md:text-xl">
            {f.q}
          </AccordionTrigger>
          <AccordionContent className="max-w-[65ch] pb-6 text-base leading-relaxed text-ink-2">{f.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
