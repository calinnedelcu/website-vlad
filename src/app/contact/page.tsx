import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { LeadForm } from "@/components/LeadForm";
import { SplitReveal } from "@/components/SplitReveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Scrie-i lui ${site.name} ce cauți în București — răspunde în aceeași zi.`,
};

export default function ContactPage() {
  return (
    // Două panouri, nu o pagină cu două coloane: stânga pe negru ține datele
    // de contact, dreapta pe hârtie ține formularul. Se vede din prima că sunt
    // două căi diferite spre același om.
    <section className="grid md:min-h-[calc(100dvh-5rem)] md:grid-cols-2">
      <div className="bg-void text-paper flex flex-col justify-center px-5 py-20 md:px-10 md:py-24 xl:px-16">
        <p className="eyebrow text-paper/55">Contact</p>
        <SplitReveal as="h1" className="display-lg mt-6 max-w-[12ch]" immediate>
          Spune-mi ce cauți
        </SplitReveal>

        <Reveal delay={100}>
          <p className="text-paper/75 mt-8 max-w-[40ch] text-lg">
            Cel mai rapid e pe WhatsApp. Dacă preferi să scrii pe îndelete, formularul din dreapta
            ajunge tot la mine.
          </p>
        </Reveal>

        <Reveal delay={160}>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={site.contact.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="bg-paper text-void px-7 py-4 text-sm transition-opacity duration-300 hover:opacity-85"
            >
              WhatsApp
            </a>
            <a
              href={site.contact.phoneHref}
              className="border-paper/40 text-paper btn-sweep hover:text-void border px-7 py-4 text-sm transition-colors duration-500"
            >
              {site.contact.phone}
            </a>
          </div>
        </Reveal>

        <Reveal delay={220}>
          <dl className="border-void-line mt-12 border-t pt-6 text-sm">
            <div className="flex justify-between gap-4 py-2">
              <dt className="eyebrow text-paper/50">Email</dt>
              <dd>
                <a href={`mailto:${site.contact.email}`} className="link-underline">
                  {site.contact.email}
                </a>
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="eyebrow text-paper/50">Agenție</dt>
              <dd>{site.contact.office}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="eyebrow text-paper/50">Comision</dt>
              <dd>0% pentru cumpărător și chiriaș</dd>
            </div>
          </dl>
        </Reveal>
      </div>

      <div className="flex flex-col justify-center px-5 py-20 md:px-10 md:py-24 xl:px-16">
        <Reveal delay={120}>
          <LeadForm />
        </Reveal>
      </div>
    </section>
  );
}
