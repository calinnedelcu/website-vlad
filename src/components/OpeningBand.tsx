import { Photo } from "./Photo";
import { site } from "@/lib/site";

/**
 * Prima bandă a site-ului: Vlad și sigla agenției, înainte de proprietăți.
 *
 * E cerută explicit de Vlad — vrea ca primul lucru la deschidere să fie el și
 * Trîmbițașu Estate, iar ofertele imediat după. Nu e ecran plin, ci o bandă de
 * ~44% din înălțime, din două motive practice:
 *
 * 1. Fotografia e făcută cu telefonul, seara, cu blitz. La lățime de ecran
 *    întreg i se văd zgomotul, temperaturile de culoare amestecate și cutele
 *    de pe cămașă. La mărimea asta arată ca un portret, nu ca un screenshot.
 * 2. Cadrul e portret (1600×2048). Întins peste un ecran de 2560px lat ar
 *    rămâne din el o fâșie fără cap.
 *
 * Așa, pe primul ecran intră și el, și începutul primei proprietăți.
 *
 * Nu are titlu mare și nu repetă „Trîmbițașu Estate” ca text: sigla o spune
 * deja, iar numele stă în header, la doi centimetri deasupra.
 */
export function OpeningBand() {
  return (
    <section
      // `data-dark-hero` ține header-ul alb cât e deasupra. Acum sunt două
      // secțiuni închise una după alta, deci SiteHeader le verifică pe toate,
      // nu doar pe prima — vezi acolo.
      data-dark-hero
      // Aceeași înălțime peste tot. Pe telefon era 52svh, iar cum lățimea
      // benzii și proporția cadrului erau aproape identice, se vedea 2%→90%
      // din fotografie — practic tot, inclusiv mâinile împreunate în poală, la
      // 83–90%. Ele ajungeau centrul vizual al benzii.
      //
      // Acum 50svh, cerut de Vlad („poza cu mine o țâră mai mare”). Se vede
      // 4%→69% din cadru: cap și umeri, mâinile rămân afară. Cifra nu e
      // aleasă doar ca să fie mai mare — 50svh aici plus 46svh la hero încap
      // împreună într-un ecran, deci primul ecran ține și fața lui, și prima
      // ofertă. Dacă schimbi una, uită-te și la cealaltă.
      className="bg-void text-paper relative isolate -mt-20 h-[50svh] min-h-[21rem] overflow-hidden"
    >
      {/* Pe telefon fotografia e fundalul întregii benzi; de la `md` în sus se
          retrage în dreapta, ca să nu fie nevoie s-o întindem pe lat.

          Caseta iese cu 15% în afara ecranului, în ambele părți, și asta nu e
          o scăpare. `object-fit: cover` taie doar cât trebuie ca să umple
          caseta: pe un telefon îngust, banda ajunge aproape la proporția
          cadrului (0.89 față de 0.78), deci nu se taie mai nimic — se vedea
          1%→89% din fotografie, adică tot, cu mâinile împreunate în poală.
          `object-position` singur n-are ce face acolo, fiindcă nu mai există
          surplus de mutat. O casetă mai lată forțează decuparea pe verticală
          și lasă cap și umeri. */}
      <div className="absolute inset-y-0 -right-[15%] -left-[15%] md:right-0 md:left-auto md:w-[42%]">
        <Photo
          src={site.portraitOffice}
          alt={`${site.name}, ${site.role.toLowerCase()} la ${site.agency}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 42vw"
          className="object-cover object-[center_12%]"
        />
        <div className="scrim-band pointer-events-none absolute inset-0" />
      </div>

      <div className="shell relative flex h-full flex-col justify-end pt-24 pb-10 md:pb-14">
        {/* Doar sigla și o linie. Numele lui e în header, la doi centimetri
            deasupra, iar „Trîmbițașu Estate” scris ca text ar repeta sigla —
            adică aceleași două cuvinte de trei ori într-un singur ecran. */}
        <div className="flex items-end gap-5 md:gap-6">
          {/* Doar monograma, decupată, deci stă direct pe negru fără casetă în
              jur. Cuvântul-marcă din siglă e lăsat afară dinadins — vezi
              `agencyMark` în site.ts. */}
          <Photo
            src={site.agencyMark}
            alt={site.agency}
            width={790}
            height={639}
            priority
            sizes="(max-width: 768px) 5rem, 7rem"
            className="h-14 w-auto md:h-20"
          />

          {/* `h1`-ul prim ei pagini. A fost până acum titlul mare din secțiunea
              „Ce fac”; când Vlad a cerut ca titlul ăla să plece, pagina a rămas
              fără niciun titlu de nivel unu — adică fără să spună nicăieri, în
              structura documentului, despre ce e vorba. E aici pentru că e
              singurul text de sus care descrie pagina, nu o proprietate anume.
              Numele lui îl poartă `sr-only`: pe ecran l-ar repeta pe cel din
              header, la doi centimetri deasupra, dar un titlu fără el ar fi
              „Agent imobiliar” al nimănui. Arată exact la fel ca înainte. */}
          <h1 className="eyebrow text-paper/75 pb-2">
            <span className="sr-only">{site.name} — </span>
            {site.role}
            <span className="block">București și Ilfov</span>
          </h1>
        </div>
      </div>
    </section>
  );
}
