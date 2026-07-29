import { Photo } from "@/components/Photo";
import Link from "next/link";
import { HeroCinematic } from "@/components/HeroCinematic";
import { HorizontalShowcase } from "@/components/HorizontalShowcase";
import { OpeningBand } from "@/components/OpeningBand";
import { PortfolioMap } from "@/components/PortfolioMap";
import { Reveal } from "@/components/Reveal";
import { SplitReveal } from "@/components/SplitReveal";
import {
  availableProperties,
  neighborhoods,
  properties,
  soldProperties,
} from "@/lib/properties";
import { site } from "@/lib/site";

/**
 * Prima pagină ține șase lucruri, în ordinea asta: cine e, ce vinde acum, ce
 * face, ce a vândut deja, cum îl suni, mărunțișul.
 *
 * Vlad a cerut o pagină scurtă. Scurtarea n-a însemnat să ștergem conținut, ci
 * să nu-l mai spunem de două ori:
 *
 * - „Cum lucrez” (comision 0%, exclusivitate, anunțuri cu cifre) spunea exact
 *   ce spune „Ce poți să aștepți” de pe /despre. A rămas acolo, cu textul mai
 *   bun de aici. Costa 1,5 ecrane pentru zero informație nouă.
 * - Al doilea paragraf din „Ce fac” („sunt două piețe cu ritmuri diferite”) e
 *   povestea de pe /despre, repovestită. A plecat.
 * - Harta s-a mutat pe /proprietati. Nu e decor, e unealtă de căutare: acolo
 *   te uiți pe zone și dai imediat în listă. Aici era frumoasă și fără urmare.
 *
 * Dacă adaugi ceva aici, întreabă-te întâi dacă nu scrie deja pe alt ecran.
 */
export default function HomePage() {
  const available = availableProperties();
  const sold = soldProperties();
  const commercial = available.filter((p) => p.segment === "comercial");
  const zones = neighborhoods();

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
      <section id="manifest" className="shell py-20 md:py-28">
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
            {/* `h1`-ul paginii stă aici de când banda cu ofertele a rămas fără
                titlu — vezi HeroCinematic. E și locul potrivit: fraza asta
                spune întreg ce se vinde, iar sus, peste fotografii de
                apartamente, jumătate din ea era despre hale. */}
            <SplitReveal as="h1" className="display-lg max-w-[20ch]" stagger={80}>
              Vând apartamente în București și spații industriale în Ilfov.
            </SplitReveal>

            {/* Un singur paragraf. Al doilea explica de ce ține două piețe
                deodată — dar aia e chiar povestea de pe /despre, spusă a doua
                oară cu alte cuvinte. Cine vrea explicația are linkul dedesubt.
                `site.intro` rămâne pentru că duce singurul lucru pe care omul
                chiar trebuie să-l afle devreme: comisionul nu vine de la el. */}
            <div className="mt-10">
              <Reveal delay={120}>
                <p className="lede max-w-[52ch]">{site.intro}</p>
                <Link href="/despre" className="link-underline mt-6 inline-block text-sm">
                  Despre Vlad
                </Link>
              </Reveal>
            </div>

            {/* Cifrele care chiar spun ceva. Restul blocului de statistici a
                plecat pe /despre — se repeta cu ce se vede oricum mai jos.
                A treia duce la harta de dedesubt: e și cifră, și indicator că
                harta există, pentru cine nu derulează. */}
            <Reveal delay={200}>
              <div className="border-line mt-10 flex flex-wrap gap-x-12 gap-y-4 border-t pt-6">
                <p className="nums text-sm">
                  <span className="font-display mr-2 text-2xl">{available.length}</span>
                  proprietăți în portofoliu, acum
                </p>
                <p className="nums text-sm">
                  <span className="font-display mr-2 text-2xl">{commercial.length}</span>
                  spații comerciale și industriale
                </p>
                <Link href="#harta" className="nums group text-sm">
                  <span className="font-display mr-2 text-2xl">{zones.length}</span>
                  <span className="link-underline">zone, pe hartă</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Harta. A plecat o rundă pe /proprietati, ca prima pagină să se
          scurteze — și Vlad a observat în aceeași seară că lipsește. Are
          dreptate: e singurul loc de pe site unde „București și Ilfov” devine
          ceva ce se vede, nu o formulă. S-a întors, și e și pe /proprietati,
          dar acolo în celălalt mod — acolo filtrează, aici povestește. Costă
          1,3 ecrane din prima pagină; le plătim conștient. */}
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

      {/* Aici era „Cum lucrez”: comision plătit de proprietar, exclusivitate,
          anunțuri cu cifre. Trei lucruri adevărate și importante — dar scrise
          deja, cuvânt cu cuvânt ca înțeles, în „Ce poți să aștepți” de pe
          /despre. Un ecran și jumătate ca să repeți o pagină de alături.
          Textele bune de aici s-au dus acolo, deci n-a rămas nimic pe drum.
          Iar comisionul, singurul care contează în primele secunde, e oricum
          în paragraful de sus. */}

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
          <div className="shell relative py-20 text-center md:py-28">
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
