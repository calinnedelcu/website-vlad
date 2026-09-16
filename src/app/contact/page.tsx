import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { SplitReveal } from "@/components/SplitReveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Scrie-i lui ${site.name} ce cauți în București — răspunde în aceeași zi.`,
};

/**
 * Pagina de contact.
 *
 * A avut până în septembrie 2026 un formular pe jumătatea din dreapta: nume,
 * telefon, email, „ce cauți”, bifă de acord. Scos la cererea lui Vlad.
 *
 * Nu s-a pierdut niciun drum către el. Site-ul e static, deci nu exista server
 * care să trimită un email — formularul doar compunea mesajul și deschidea tot
 * WhatsApp-ul. Adică cinci câmpuri de completat pentru a ajunge unde duce
 * butonul de alături dintr-o singură apăsare. Odată cu el au plecat
 * `LeadForm.tsx` și `lib/lead.ts` (validarea și compunerea mesajului), rămase
 * fără nimeni care să le cheme.
 *
 * Ce a rămas: WhatsApp, telefon, email, și datele agenției. Layout-ul e acum
 * o singură coloană — cu grila pe două, jumătatea dreaptă ar fi rămas un
 * dreptunghi alb și gol.
 */
export default function ContactPage() {
  return (
    <section className="bg-void text-paper flex min-h-[calc(100dvh-5rem)] flex-col justify-center px-5 py-20 md:px-10 md:py-24 xl:px-16">
      {/* Centrat, nu lipit stânga: fără formularul din dreapta, conținutul
          lăsa 470px de negru gol lângă el pe un ecran de 1280 — același gol
          care a deranjat la „Cum lucrez”. Textul rămâne aliniat la stânga
          înăuntru; doar blocul se așază la mijloc. */}
      <div className="mx-auto w-full max-w-[46rem]">
        <p className="eyebrow text-paper/55">Contact</p>
        <SplitReveal as="h1" className="display-lg mt-6 max-w-[12ch]" immediate>
          Spune-mi ce cauți
        </SplitReveal>

        <Reveal delay={100}>
          {/* Fraza spunea „formularul din dreapta ajunge tot la mine”. Nu mai e
              niciun formular și nicio dreaptă. */}
          <p className="text-paper/75 mt-8 max-w-[40ch] text-lg">
            Cel mai rapid e pe WhatsApp. Dacă preferi să scrii pe îndelete, ai emailul mai jos.
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
          <dl className="border-void-line mt-12 max-w-[34rem] border-t pt-6 text-sm">
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
    </section>
  );
}
