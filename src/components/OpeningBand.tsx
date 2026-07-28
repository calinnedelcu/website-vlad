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
      className="bg-void text-paper relative isolate -mt-20 h-[52svh] min-h-[22rem] overflow-hidden md:h-[44svh]"
    >
      {/* Pe telefon fotografia e fundalul întregii benzi; de la `md` în sus se
          retrage în dreapta, ca să nu fie nevoie s-o întindem pe lat. */}
      <div className="absolute inset-0 md:right-0 md:left-auto md:w-[42%]">
        <Photo
          src={site.portraitOffice}
          alt={`${site.name}, ${site.role.toLowerCase()} la ${site.agency}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 42vw"
          className="object-cover object-[center_20%]"
        />
        <div className="scrim-band pointer-events-none absolute inset-0" />
      </div>

      <div className="shell relative flex h-full flex-col justify-end pt-24 pb-10 md:pb-14">
        {/* Doar sigla și o linie. Numele lui e în header, la doi centimetri
            deasupra, iar „Trîmbițașu Estate” scris ca text ar repeta sigla —
            adică aceleași două cuvinte de trei ori într-un singur ecran. */}
        <div className="flex items-end gap-5 md:gap-6">
          {/* Decupată, deci stă direct pe negru fără casetă în jur. */}
          <Photo
            src={site.agencyLogo}
            alt={site.agency}
            width={790}
            height={976}
            priority
            sizes="(max-width: 768px) 4.5rem, 6rem"
            className="h-18 w-auto md:h-24"
          />

          <p className="eyebrow text-paper/75 pb-2">
            {site.role}
            <span className="block">București și Ilfov</span>
          </p>
        </div>
      </div>
    </section>
  );
}
