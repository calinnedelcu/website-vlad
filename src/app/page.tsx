import { Photo } from "@/components/Photo";
import Link from "next/link";
import { HeroCinematic } from "@/components/HeroCinematic";
import { HorizontalShowcase } from "@/components/HorizontalShowcase";
import { OpeningBand } from "@/components/OpeningBand";
import { PortfolioMap } from "@/components/PortfolioMap";
import { Reveal } from "@/components/Reveal";
import { SplitReveal } from "@/components/SplitReveal";
import { availableProperties, properties, soldProperties } from "@/lib/properties";
import { site } from "@/lib/site";

/**
 * Textele de mai jos sunt scrise strict pe ce se poate demonstra din
 * portofoliul real: comision 0% și exclusivitate pe anunțuri, descrieri cu
 * repere și distanțe verificabile, prezență pe două piețe diferite.
 * Nu inventa aici cifre sau promisiuni — vezi README.
 */
const steps = [
  {
    n: "01",
    title: "Comisionul îl plătește proprietarul",
    body: "Pe toate proprietățile din portofoliu, cumpărătorul și chiriașul nu plătesc comision. Scrie pe fiecare anunț, deci poți verifica înainte să mă suni.",
  },
  {
    n: "02",
    title: "Majoritatea sunt în exclusivitate",
    body: "Când o proprietate e luată în exclusivitate, o țin eu. Știu de când e pe piață, ce s-a schimbat la preț și ce au reclamat oamenii care au venit s-o vadă. Pot să-ți răspund fără să sun pe altcineva.",
  },
  {
    n: "03",
    title: "Anunțuri scrise cu cifre",
    body: "În descrieri găsești strada, etajul, ce s-a renovat și în ce an, cât faci pe jos până la metrou sau la stație. Dacă lipsește ceva important, scriu și asta — ca să nu te deplasezi degeaba.",
  },
];

export default function HomePage() {
  const available = availableProperties();
  const sold = soldProperties();
  const commercial = available.filter((p) => p.segment === "comercial");

  // Hero-ul ține ce e de vânzare ACUM. Selecția de dedesubt ține ce a vândut
  // DEJA. Înainte, amândouă arătau aceleași proprietăți marcate `featured` —
  // aceeași listă, la două ecrane distanță.
  //
  // Și numai rezidențial, cerut de Vlad: prima pagină trebuie să deschidă cu
  // apartamente. Din cele 5 proprietăți marcate `featured`, 3 erau hale și
  // spații comerciale, deci jumătate din hero era hală. Halele nu dispar de pe
  // site — au pagina lor și sunt pe hartă — doar că nu ele întâmpină omul.
  //
  // Ordinea: întâi cele alese de el, apoi restul, ca selecția să conteze fără
  // să rămână hero-ul gol dacă `featured` se schimbă.
  const residential = available.filter((p) => p.segment === "rezidential");
  const heroSlides = [
    ...residential.filter((p) => p.featured),
    ...residential.filter((p) => !p.featured),
  ].slice(0, 4);
  const showcase = sold.slice(0, 6);
  // Fotografia de la final: tot rezidențial, dar una care nu e deja în hero —
  // altfel s-ar vedea aceeași poză de două ori pe aceeași pagină.
  const closer = residential.find((p) => !heroSlides.includes(p)) ?? residential[0];

  return (
    <>
      {/* Cerut de Vlad: primul lucru la deschidere e el și agenția, apoi
          ofertele. Vezi OpeningBand pentru de ce e bandă, nu ecran plin. */}
      <OpeningBand />

      <HeroCinematic properties={heroSlides} />

      {/* ---------- Manifest ---------- */}
      <section id="manifest" className="shell py-24 md:py-40">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Aici era al doilea portret al lui Vlad, cu numele și rolul sub el.
              A plecat când prima pagină a primit banda de deschidere: fața lui
              e acum primul lucru de pe site, mare, iar a doua fotografie a lui
              la două ecrane distanță nu mai adăuga nimic — doar repeta, și
              odată cu ea repeta și „Agent imobiliar”. */}
          <div className="md:col-span-3">
            <Reveal>
              <p className="eyebrow">Ce fac</p>
            </Reveal>
          </div>

          <div className="md:col-span-8 md:col-start-5">
            <SplitReveal className="display-lg max-w-[20ch]" stagger={80}>
              Vând apartamente în București și spații industriale în Ilfov.
            </SplitReveal>

            <div className="mt-12 grid gap-10 md:grid-cols-2">
              <Reveal delay={120}>
                <p className="lede">{site.intro}</p>
              </Reveal>
              <Reveal delay={200}>
                <p className="text-muted">
                  Sunt două piețe cu ritmuri diferite. La un apartament contează etajul, lumina
                  și cât faci pe jos până la metrou. La o hală contează înălțimea utilă, curentul
                  trifazic și cât faci până la A0. Le țin pe amândouă pentru că am clienți pentru
                  amândouă.
                </p>
                <Link href="/despre" className="link-underline mt-6 inline-block text-sm">
                  Despre Vlad
                </Link>
              </Reveal>
            </div>

            {/* Cele două cifre care chiar spun ceva. Restul blocului de
                statistici a plecat pe /despre — se repeta cu ce se vede
                oricum mai jos. */}
            <Reveal delay={260}>
              <div className="border-line mt-12 flex flex-wrap gap-x-12 gap-y-4 border-t pt-6">
                <p className="nums text-sm">
                  <span className="font-display mr-2 text-2xl">{available.length}</span>
                  proprietăți în portofoliu, acum
                </p>
                <p className="nums text-sm">
                  <span className="font-display mr-2 text-2xl">{commercial.length}</span>
                  spații comerciale și industriale
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Aici era o bandă cu numele cartierelor, care curgea la nesfârșit.
          Spunea exact același lucru ca harta — „lucrez în zonele astea” — dar
          îl spunea ca decor: nu puteai citi din ea nici unde sunt, nici câte
          sunt, nici care e diferența dintre ele. Aceeași informație, arătată
          în loc să fie derulată, și fără să crească pagina cu un ecran. */}
      <PortfolioMap properties={properties} />

      {/* ---------- Portofoliul, pe orizontală ---------- */}
      {/* Ce a vândut, cu fotografii mari. Ce e disponibil acum se vede sus, în
          hero, și complet pe /proprietati. */}
      {showcase.length > 0 && (
        <HorizontalShowcase
          properties={showcase}
          eyebrow="Track record"
          title="Câteva din ce am vândut"
          linkHref="/tranzactii"
          linkLabel="Toate tranzacțiile"
        />
      )}



      {/* ---------- Cum lucrez ---------- */}
      <section id="cum-lucrez" className="bg-paper-deep py-24 md:py-32">
        <div className="shell grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="md:sticky md:top-28">
              <Reveal>
                <p className="eyebrow">Cum lucrez</p>
              </Reveal>
              <SplitReveal className="display-md mt-4 max-w-[14ch]">
                Trei lucruri pe care le poți verifica
              </SplitReveal>

              {showcase[1] && (
                <Reveal variant="image" className="mt-12 hidden aspect-4/5 w-full md:block">
                  <Photo
                    src={showcase[1].media.cover}
                    alt=""
                    fill
                    sizes="40vw"
                    className="object-cover"
                  />
                </Reveal>
              )}
            </div>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            {steps.map((step, i) => (
              <Reveal key={step.n} delay={i * 100}>
                <div className="border-line grid gap-4 border-t py-12 sm:grid-cols-[4rem_1fr]">
                  <span className="eyebrow pt-2">{step.n}</span>
                  <div>
                    <h3 className="display-sm">{step.title}</h3>
                    <p className="text-ink-soft mt-3 max-w-[52ch]">{step.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>



      {/* ---------- Închidere ---------- */}
      {closer && (
        <section id="contact-band" className="bg-void text-paper relative isolate overflow-hidden">
          <Photo
            src={closer.media.cover}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-35"
          />
          <div className="shell relative py-28 text-center md:py-44">
            <SplitReveal className="display-lg mx-auto max-w-[20ch]" stagger={80}>
              Spune-mi ce cauți și îți răspund cu ce am în portofoliu.
            </SplitReveal>
            <Reveal delay={200}>
              <div className="mt-12 flex flex-wrap justify-center gap-4">
                <a
                  href={site.contact.phoneHref}
                  className="bg-paper text-void px-9 py-4 text-sm transition-opacity duration-300 hover:opacity-85"
                >
                  {site.contact.phone}
                </a>
                <Link
                  href="/contact"
                  className="border-paper/40 text-paper btn-sweep hover:text-void border px-9 py-4 text-sm transition-colors duration-500"
                >
                  Scrie-mi
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
