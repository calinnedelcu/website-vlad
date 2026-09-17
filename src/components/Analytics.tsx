import Script from "next/script";
import { analyticsToken } from "@/lib/site";

/**
 * Măsurarea traficului, fără cookie-uri.
 *
 * DE CE CLOUDFLARE ȘI NU GOOGLE ANALYTICS. Cineva i-a recomandat lui Vlad GA,
 * cu argumentul că „așa îl indexează repede Google”. Argumentul e fals: datele
 * din Analytics nu intră în crawling, indexare sau ranking — pentru indexare
 * există Search Console, care e altceva. Iar GA4 pune identificatori pe
 * dispozitivul vizitatorului, ceea ce în UE cere consimțământ: banner de
 * cookie-uri plus politică de confidențialitate, pe un site care n-are nici
 * una, nici alta.
 *
 * Varianta asta numără la fel de bine câți intră, de unde vin și ce pagini
 * citesc, dar nu scrie nimic pe dispozitiv, deci nu cere banner. E gratuită și
 * încarcă o singură cerere, amânată.
 *
 * FĂRĂ TOKEN NU RANDEAZĂ NIMIC. Nu e o precauție de formă: până nu-și face
 * Vlad cont, un `<script>` cu token gol ar fi o cerere de rețea pe fiecare
 * pagină, către un serviciu care o respinge. Vezi `analyticsToken` în site.ts.
 */
export function Analytics() {
  if (!analyticsToken) return null;

  return (
    <Script
      // `afterInteractive` (implicit, scris aici ca să se vadă) încarcă
      // scriptul după hidratare. `lazyOnload` ar aștepta un moment liber al
      // browserului și ar rata omul care intră și pleacă în trei secunde —
      // adică exact vizita pe care vrei s-o numeri.
      strategy="afterInteractive"
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token: analyticsToken })}
    />
  );
}
