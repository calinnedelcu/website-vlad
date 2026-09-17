import type { MetadataRoute } from "next";
import { properties, updatedAt } from "@/lib/properties";
import { site } from "@/lib/site";
import { unprefixed } from "@/lib/asset";

/**
 * Obligatoriu cu `output: "export"`. Fișierele astea se compilează în Route
 * Handlers, iar la export static Next cere să spui explicit că răspunsul nu
 * depinde de cerere — altfel build-ul se oprește cu eroare. Nu e o setare de
 * performanță, e o declarație: aici nu se citește nimic din request.
 */
export const dynamic = "force-static";

/**
 * Harta site-ului pentru motoarele de căutare.
 *
 * Nu e scrisă de mână: paginile de proprietate se generează din portofoliu,
 * deci lista rămâne corectă și după ce sincronizarea aduce anunțuri noi sau
 * scoate vândute. Un sitemap scris de mână ar fi mințit din prima săptămână.
 *
 * `lastModified` la proprietăți e ora ultimei schimbări reale din CRM
 * (`updatedAt`), nu ora build-ului. Dacă am pune ora build-ului, fiecare
 * publicare ar spune motorului „totul e nou” — inclusiv când n-am schimbat
 * nimic. Pe un site care se republică zilnic, asta e zgomot, nu informație.
 *
 * BARA DE LA FINAL nu e o scăpare: `trailingSlash: true` face ca adresa chiar
 * servită să fie `/proprietati/`. Fără bară, sitemap-ul ar fi trimis motorul
 * spre adresa care doar redirecționează, iar canonical-ul paginii ar fi arătat
 * în altă parte decât sitemap-ul. Cele două trebuie să spună același lucru.
 *
 * ATENȚIE la prefix: căile din cod au `basePath` lipit (vezi `asset.ts`), dar
 * aici trebuie adrese complete, o singură dată — de aceea `unprefixed`, la fel
 * ca la cardul de share.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (cale: string) => `${site.url}${cale}`;
  const schimbat = new Date(updatedAt);

  const pagini: MetadataRoute.Sitemap = [
    { url: url("/"), lastModified: schimbat, changeFrequency: "daily", priority: 1 },
    { url: url("/proprietati/"), lastModified: schimbat, changeFrequency: "daily", priority: 0.9 },
    { url: url("/tranzactii/"), lastModified: schimbat, changeFrequency: "monthly", priority: 0.6 },
    { url: url("/contact/"), changeFrequency: "yearly", priority: 0.5 },
  ];

  const anunturi: MetadataRoute.Sitemap = properties.map((p) => ({
    url: url(unprefixed(`/proprietati/${p.slug}/`)),
    lastModified: schimbat,
    changeFrequency: "weekly",
    priority: p.status === "disponibil" ? 0.8 : 0.4,
  }));

  return [...pagini, ...anunturi];
}
