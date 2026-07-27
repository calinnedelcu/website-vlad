import { Photo } from "@/components/Photo";
import Link from "next/link";
import { CountUp } from "@/components/CountUp";
import { HeroCinematic } from "@/components/HeroCinematic";
import { HorizontalShowcase } from "@/components/HorizontalShowcase";
import { Marquee } from "@/components/Marquee";
import { Reveal } from "@/components/Reveal";
import { SplitReveal } from "@/components/SplitReveal";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyIndexList } from "@/components/PropertyIndexList";
import {
  availableProperties,
  featuredProperties,
  neighborhoods,
  portfolioStats,
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
  const zones = neighborhoods();
  const stats = portfolioStats();

  const heroSlides = (featured.length >= 3 ? featured : available).slice(0, 4);
  const showcase = available.slice(0, 8);
  const residential = available.filter((p) => p.segment === "rezidential");
  const commercial = available.filter((p) => p.segment === "comercial");
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
          </div>
        </div>
      </section>

      <Marquee items={zones} />

      {/* ---------- Portofoliul, pe orizontală ---------- */}
      <HorizontalShowcase
        properties={showcase}
        eyebrow="Portofoliu curent"
        title="Ce am acum disponibil"
      />

      {/* ---------- Cifre, calculate din portofoliu ---------- */}
      <section id="cifre" className="shell py-24 md:py-32">
        <Reveal variant="line" className="bg-line h-px w-full" />
        <div className="mt-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, i) => (
            <Reveal key={item.label} delay={i * 90}>
              <CountUp value={item.value} className="display-lg" />
              <p className="text-muted mt-4 max-w-[22ch] text-sm">{item.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Cele două piețe ---------- */}
      <section id="piete" className="bg-void text-paper py-24 md:py-32">
        <div className="shell">
          <Reveal>
            <p className="eyebrow text-paper/50">Două piețe</p>
          </Reveal>
          <div className="mt-14 grid gap-12 md:grid-cols-2">
            <Reveal>
              <Link href="/proprietati" className="group border-void-line block border-t pt-8">
                <p className="font-display text-4xl md:text-5xl">Rezidențial</p>
                <p className="text-paper/70 mt-4 max-w-[38ch]">
                  Apartamente de vânzare și de închiriat, din Cișmigiu și Floreasca până în Chiajna
                  și Voluntari. De la garsoniere de bloc nou la patru camere renovate în imobile
                  interbelice.
                </p>
                <p className="text-paper group-hover:text-bronze-soft mt-6 text-sm transition-colors duration-500">
                  {residential.length} proprietăți →
                </p>
              </Link>
            </Reveal>

            <Reveal delay={120}>
              <Link href="/proprietati" className="group border-void-line block border-t pt-8">
                <p className="font-display text-4xl md:text-5xl">Industrial și comercial</p>
                <p className="text-paper/70 mt-4 max-w-[38ch]">
                  Hale de producție și depozitare în parcuri industriale cu acces direct din
                  Centură și A0, plus spații comerciale stradale cu vad. Curent trifazic, acces TIR,
                  birouri pe două niveluri.
                </p>
                <p className="text-paper group-hover:text-bronze-soft mt-6 text-sm transition-colors duration-500">
                  {commercial.length} proprietăți →
                </p>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

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

      {/* ---------- Indexul complet ---------- */}
      <PropertyIndexList
        properties={available}
        eyebrow="Index"
        title="Tot portofoliul, pe scurt"
      />

      {/* ---------- Arhiva tranzacțiilor ----------
          Apare doar când există proprietăți marcate ca vândute/închiriate.
          Deocamdată nu avem istoricul lui — vezi README. */}
      {sold.length > 0 && (
        <section id="arhiva" className="shell py-24 md:py-32">
          <div className="border-line flex flex-wrap items-end justify-between gap-6 border-t pt-10">
            <div>
              <Reveal>
                <p className="eyebrow">Track record</p>
              </Reveal>
              <SplitReveal className="display-lg mt-4 max-w-[18ch]">
                Proprietăți intermediate
              </SplitReveal>
            </div>
            <Reveal delay={100}>
              <p className="text-muted max-w-[38ch] text-sm">
                Rămân pe site după tranzacție. E singura dovadă care contează.
              </p>
              <a
                href={site.transactionsUrl}
                target="_blank"
                rel="noreferrer"
                className="link-underline mt-3 inline-block text-sm"
              >
                Istoricul complet, pe site-ul agenției
              </a>
            </Reveal>
          </div>

          <div className="mt-16 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {sold.map((property, i) => (
              <PropertyCard key={property.slug} property={property} index={i + 1} delay={i * 100} />
            ))}
          </div>
        </section>
      )}

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
