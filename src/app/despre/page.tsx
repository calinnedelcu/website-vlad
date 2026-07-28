import type { Metadata } from "next";
import { Photo } from "@/components/Photo";
import Link from "next/link";
import { CountUp } from "@/components/CountUp";
import { Reveal } from "@/components/Reveal";
import { SplitReveal } from "@/components/SplitReveal";
import { neighborhoods, portfolioStats } from "@/lib/properties";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Despre",
  description: `${site.name}, ${site.role.toLowerCase()} la ${site.agency}. Rezidențial în București, hale și spații comerciale în Ilfov.`,
};

/**
 * DE COMPLETAT DE VLAD: povestea propriu-zisă — de când e în imobiliare, ce
 * făcea înainte, de ce s-a dus pe industrial. Nimic din ce urmează nu e
 * inventat: sunt strict lucruri care se văd în portofoliul lui. Textul e bun
 * pentru lansare, dar o pagină „Despre” fără biografie reală rămâne pe
 * jumătate. Vezi README.
 */
const story = [
  "Lucrez ca agent imobiliar la Trîmbițașu Estate, în București. Portofoliul meu are două părți: apartamente de vânzare și de închiriat în oraș, și hale de producție și depozitare în parcurile industriale de pe centură.",
  "Sunt piețe cu ritmuri diferite, și se caută altfel. La un apartament oamenii vin repede și se hotărăsc din ce văd la vizionare. La o hală discuția ține mai mult și se poartă pe alte lucruri: înălțime utilă, curent trifazic, acces pentru TIR, cât faci până la A0.",
  "Ce e la fel la amândouă: comisionul îl plătește proprietarul, nu tu. Și scriu în anunț ce e acolo — stradă, etaj, an de renovare, minute de mers pe jos — ca să știi dacă merită drumul înainte să-l faci.",
];

const values = [
  {
    title: "Comisionul nu vine de la tine",
    body: "Pe fiecare proprietate din portofoliu scrie „comision 0%” pentru cumpărător sau chiriaș. Onorariul îl plătește proprietarul.",
  },
  {
    title: "Lucrez pe exclusivitate",
    body: "Majoritatea proprietăților sunt luate în exclusivitate, deci le știu istoria și pot să-ți spun tot ce știu despre ele.",
  },
  {
    title: "Descrieri cu cifre",
    body: "Strada, etajul, anul renovării, distanța până la metrou în minute. Dacă ceva lipsește, scrie și asta.",
  },
];

export default function AboutPage() {
  const stats = portfolioStats();
  const zones = neighborhoods();

  return (
    <>
      {/* ---------- Deschidere: portret + declarație ----------
          Portretul e vertical — de aceea nu merge full-bleed peste tot
          ecranul ca pe celelalte pagini, ci stă într-o coloană alături de
          titlu. Sigla agenției din spatele lui duce și brandul, nu doar
          chipul. */}
      <section className="shell py-16 md:py-24">
        <div className="grid items-end gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <Reveal>
              <p className="eyebrow">Despre</p>
            </Reveal>
            <SplitReveal as="h1" className="display-lg mt-6 max-w-[16ch]" immediate>
              Două piețe, un singur telefon.
            </SplitReveal>
            <Reveal delay={140}>
              <p className="lede mt-8 max-w-[46ch]">
                {site.name} — {site.role.toLowerCase()} la {site.agency}. Rezidențial în București,
                industrial și comercial în Ilfov.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={site.contact.phoneHref}
                  className="bg-ink text-paper px-7 py-4 text-sm transition-opacity duration-300 hover:opacity-85"
                >
                  {site.contact.phone}
                </a>
                <Link
                  href="/proprietati"
                  className="border-ink text-ink btn-sweep hover:text-paper border px-7 py-4 text-sm transition-colors duration-500"
                >
                  Vezi portofoliul
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal variant="image" delay={100} className="aspect-4/5 w-full md:col-span-4 md:col-start-9">
            <Photo
              src={site.portrait}
              alt={`${site.name}, ${site.role.toLowerCase()} la ${site.agency}`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-center"
            />
          </Reveal>
        </div>
      </section>

      {/* ---------- Povestea ---------- */}
      <section className="bg-paper-deep py-20 md:py-28">
        <div className="shell grid gap-16 md:grid-cols-12">
          <Reveal className="md:col-span-4">
            <p className="eyebrow">Parcurs</p>
            <p className="mt-4 text-sm">
              {site.role} la {site.agency}
            </p>
            <p className="text-muted text-sm">
              {site.city} și Ilfov · {zones.length} zone
            </p>
          </Reveal>

          <div className="md:col-span-7 md:col-start-6">
            {story.map((paragraph, i) => (
              <Reveal key={i} delay={i * 80}>
                <p
                  className={
                    i === 0
                      ? "font-display text-2xl leading-snug md:text-[2rem]"
                      : "text-ink-soft mt-6 text-[1.0625rem] leading-relaxed"
                  }
                >
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Ce poți să aștepți ---------- */}
      <section className="shell py-20 md:py-28">
        <Reveal>
          <p className="eyebrow">Ce poți să aștepți</p>
        </Reveal>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {values.map((value, i) => (
            <Reveal key={value.title} delay={i * 100}>
              <div className="border-line border-t pt-6">
                <h2 className="display-sm max-w-[18ch]">{value.title}</h2>
                <p className="text-ink-soft mt-4 text-sm">{value.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Cifre ---------- */}
      <section className="bg-void text-paper py-20 md:py-28">
        <div className="shell grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, i) => (
            <Reveal key={item.label} delay={i * 90}>
              <CountUp value={item.value} className="display-md" />
              <p className="text-paper/60 mt-3 max-w-[22ch] text-sm">{item.label}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
