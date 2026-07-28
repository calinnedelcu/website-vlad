import { site } from "@/lib/site";

/**
 * Subsolul.
 *
 * A fost la un moment dat aproape o a doua pagină: titlu mare „Spune-mi ce
 * cauți...”, două butoane, patru coloane. Problema e că repeta lucruri care
 * erau deja pe ecran în clipa aia:
 *
 * - titlul relua aproape cuvânt cu cuvânt banda de contact de pe home, la două
 *   ecrane distanță („Spune-mi ce cauți. Îți zic în două minute...”);
 * - coloana „Navigare” era identică cu meniul din header, care e fix și se
 *   vede tot timpul;
 * - telefonul apărea de până la patru ori simultan — în header pe desktop, în
 *   bara lipită jos pe mobil, pe butonul din subsol și în coloana de contact;
 * - pe `/contact` repeta pagina pe care omul tocmai o citea.
 *
 * Acum ține exact ce n-are alt loc pe site: emailul, rețelele, cine e și
 * pentru cine lucrează, și mărunțișul legal. Contactul rămâne la un click —
 * header pe desktop, `StickyContact` pe mobil — deci nu s-a pierdut nimic.
 *
 * Culoarea: era singurul loc din tot codul care folosea verdele `forest`, o
 * rămășiță dintr-o paletă mai veche. Închisul e rezervat momentelor cu
 * fotografie; subsolul n-are fotografie, deci n-are de ce să fie închis.
 */
export function SiteFooter() {
  return (
    <footer className="bg-paper-deep text-ink mt-32">
      <div className="shell py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-2xl leading-none">{site.name}</p>
            <p className="text-muted mt-2 text-sm">
              {site.role} la {site.agency}, {site.city}.
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="eyebrow">Scrie-mi</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href={`mailto:${site.contact.email}`} className="link-underline break-all">
                  {site.contact.email}
                </a>
              </li>
              <li>
                <a
                  href={site.contact.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="link-underline"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 md:col-start-10">
            <p className="eyebrow">Social</p>
            <ul className="mt-4 space-y-2 text-sm">
              {site.social.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="link-underline"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-line text-muted mt-14 flex flex-col gap-2 border-t pt-6 text-xs sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}
          </p>
          <p>Suprafețele sunt aproximative. Prețurile nu includ taxele notariale.</p>
        </div>
      </div>
    </footer>
  );
}
