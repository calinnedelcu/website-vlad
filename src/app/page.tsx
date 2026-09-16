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

      {/* Aici a fost secțiunea „Ce fac”. A pierdut, pe rând, portretul al
          doilea al lui Vlad, apoi titlul mare și paragraful de prezentare —
          până a rămas o etichetă de secțiune cu patru cifre sub ea. O categorie
          întreagă din pagină, pentru niște numere. Așa că s-a desființat, iar
          cifrele care contează au trecut în „Cum lucrez”, de mai jos.

          Ce a mai plecat odată cu ea:
          - `h1`-ul paginii era titlul de acolo; s-a mutat pe eticheta din banda
            de deschidere. Fără el, prima pagină n-ar avea niciun titlu de nivel
            unu. Vezi OpeningBand.
          - Cifrele „spații comerciale” și „zone, pe hartă” — scoase de Vlad.
            Harta rămâne oricum vizibilă mai jos, deci n-avea nevoie de un
            indicator că există.
          - `site.intro` nu e cod mort: din el se face descrierea paginii în
            meta și pe cardul de share. Vezi layout.tsx.
          - Drumul spre /despre a rămas în meniu, pe toate paginile. */}

      {/* ---------- Salutul ----------
          Textul e scris de Vlad, cuvânt cu cuvânt (vezi `site.greeting`).
          Stă aici, între oferte și „Cum lucrez”, fiindcă asta e ordinea firească
          a unei prezentări: îi vezi fața sus, vezi ce vinde, afli cine e, apoi
          cum lucrează.

          Fără etichetă de secțiune și fără grilă pe douăsprezece coloane, spre
          deosebire de tot ce urmează. Două motive: secțiunea de dedesubt are
          deja etichetă-stânga + text-dreapta, iar două la rând ar fi făcut
          pagina să pară un formular; și o etichetă („Despre mine”) ar fi spus
          exact ce spune prima propoziție, cu două cuvinte înainte. Un salut nu
          se anunță.

          Centrat, pe 34ch, după modelul trimis de Calin. Centrarea merge aici
          tocmai fiindcă e scurt și e singurul bloc de felul ăsta din pagină —
          pe text lung ar obosi, fiindcă ochiul caută de fiecare dată începutul
          rândului. Măsura ține rândurile pe la 34 de caractere; pe toată
          lățimea ar ajunge la ~90, de două ori peste cât urmărește ochiul.

          Fără umplutură jos: dedesubt urmează „Cum lucrez”, tot pe crem. Două
          secțiuni de aceeași culoare care se ating n-au margine vizibilă între
          ele, deci umpluturile lor se adună — 112 de aici plus 112 de acolo
          făceau 224px de gol, care se citea ca o pagină neterminată. */}
      <section id="salut" className="shell py-20 md:py-28">
        <div className="border-line border-t pt-10 md:pt-14">
          {site.greeting.map((paragraf, i) => (
            <Reveal key={i} delay={i * 140}>
              <p className={`greeting mx-auto max-w-[34ch] text-center ${i > 0 ? "mt-6 md:mt-8" : ""}`}>
                {paragraf}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Aici a fost „Cum lucrez”: titlul „Comision 0 pentru cumpărător și
          chiriaș” și trei rânduri — reprezentare exclusivă, colaborare,
          transparență. Scoasă de Vlad: salutul de mai sus o înlocuiește, și are
          dreptate, spun același lucru cu alte cuvinte (abordare modernă,
          atenție la detalii, orientare către rezultate).

          ATENȚIE, ce s-a pierdut odată cu ea: comisionul nu mai scrie nicăieri
          pe prima pagină. Nu s-a pierdut de pe site — e pe /proprietati, pe
          /contact, pe /despre și pe fiecare anunț în parte, unde scrie
          „Comision 0% pentru cumpărător/chiriaș”. Dar cine intră doar pe prima
          pagină nu mai află. Dacă vrei să revină, cel mai ieftin loc e o linie
          sub salut.

          Cele două cifre („N vânzări / N chirii”) au trecut o rundă sub salut,
          apoi le-a scos și pe ele. Erau ultimul lucru rămas din secțiunea asta.
          Dacă le vrei înapoi, se calculau din `availableProperties()` după
          `deal` — nu erau scrise de mână, deci nu s-a pierdut nicio cifră. */}

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
