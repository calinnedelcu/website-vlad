import { Photo } from "@/components/Photo";
import Link from "next/link";
import { HeroCinematic } from "@/components/HeroCinematic";
import { HorizontalShowcase } from "@/components/HorizontalShowcase";
import { Marquee } from "@/components/Marquee";
import { Reveal } from "@/components/Reveal";
import { SplitReveal } from "@/components/SplitReveal";
import {
  availableNeighborhoods,
  availableProperties,
  featuredProperties,
  soldProperties,
} from "@/lib/properties";
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
    title: "Comision 0% de la tine",
    body: "Pe fiecare proprietate din portofoliu, cumpărătorul sau chiriașul nu plătește comision. Onorariul vine de la proprietar. E scris pe fiecare anunț, nu e o ofertă de moment.",
  },
  {
    n: "02",
    title: "Majoritatea sunt în exclusivitate",
    body: "Când o proprietate e luată în exclusivitate, nu concurez cu alți cinci agenți pe același anunț. Înseamnă că știu istoria ei, pot negocia serios și îți răspund la orice întrebare fără să sun pe altcineva.",
  },
  {
    n: "03",
    title: "Scriu ce e acolo, cu metri și minute",
    body: "În descrieri găsești strada, etajul, ce s-a schimbat și în ce an, cât faci pe jos până la metrou sau la stație. Nu „ultracentral, superb”. Dacă ceva lipsește dintr-o proprietate, o afli înainte să te deplasezi.",
  },
];

export default function HomePage() {
  const featured = featuredProperties();
  const available = availableProperties();
  const sold = soldProperties();
  // Doar zonele cu stoc — vezi `availableNeighborhoods`.
  const zones = availableNeighborhoods();
  const commercial = available.filter((p) => p.segment === "comercial");

  // Hero-ul ține ce e de vânzare ACUM. Selecția de dedesubt ține ce a vândut
  // DEJA. Înainte, amândouă arătau aceleași proprietăți marcate `featured` —
  // aceeași listă, la două ecrane distanță.
  const heroSlides = (featured.length >= 3 ? featured : available).slice(0, 4);
  const showcase = sold.slice(0, 6);
  const closer = featured[1] ?? available[0];

  return (
    <>
      <HeroCinematic properties={heroSlides} />

      {/* ---------- Manifest ---------- */}
      <section id="manifest" className="shell py-24 md:py-40">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Coloana cu omul. Un site de agent fără fața agentului pe prima
              pagină e o broșură — oamenii aleg persoana, nu agenția. */}
          <div className="md:col-span-3">
            <Reveal>
              <p className="eyebrow">Ce fac</p>
            </Reveal>

            <Reveal
              variant="image"
              delay={80}
              className="mt-8 aspect-4/5 w-full max-w-[15rem] md:mt-10 md:max-w-none"
            >
              <Photo
                src={site.portrait}
                alt={`${site.name}, ${site.role.toLowerCase()} la ${site.agency}`}
                fill
                sizes="(max-width: 768px) 60vw, 24vw"
                className="object-cover object-center"
              />
            </Reveal>

            <Reveal delay={180}>
              <p className="mt-5 text-sm">{site.name}</p>
              <p className="text-muted text-sm">
                {site.role} · {site.agency}
              </p>
            </Reveal>
          </div>

          <div className="md:col-span-8 md:col-start-5">
            <SplitReveal className="display-lg max-w-[20ch]" stagger={80}>
              Un apartament în Floreasca și o hală lângă A0 nu se vând la fel.
            </SplitReveal>

            <div className="mt-12 grid gap-10 md:grid-cols-2">
              <Reveal delay={120}>
                <p className="lede">{site.intro}</p>
              </Reveal>
              <Reveal delay={200}>
                <p className="text-muted">
                  Unul se vinde cu lumina de dimineață și cu drumul până la metrou. Celălalt, cu
                  curentul trifazic și cu cât faci până la centură. Am în portofoliu și una, și
                  alta — și le tratez ca pe două meserii diferite, pentru că sunt.
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

      <Marquee items={zones} />

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
              Spune-mi ce cauți. Îți zic în două minute dacă am sau nu.
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
