import { realSocial, site } from "@/lib/site";
import { unprefixed } from "@/lib/asset";
import { availableNeighborhoods } from "@/lib/properties";

/**
 * Datele structurate despre Vlad, pentru mașini.
 *
 * DE CE EXISTĂ. Tot portofoliul de pe site-ul ăsta se sincronizează singur
 * fiindcă agenția publică `RealEstateListing` în schema.org pe fiecare anunț —
 * vezi `scripts/sync-properties.mjs`. Site-ul lui nu publica nimic. Adică
 * citeam date structurate de la alții și nu ofeream niciuna, deși pentru un om
 * care vrea să fie găsit e chiar diferența dintre „o pagină” și „un agent
 * imobiliar din București, cu telefon, zonă și conturi”.
 *
 * Google nu garantează nimic din ce citește aici. Dar fără asta n-are ce citi.
 *
 * REGULA CASEI SE APLICĂ ȘI AICI: nimic inventat. Numărul de proprietăți și
 * zonele se calculează din portofoliul real, ca peste tot; dacă mâine se
 * schimbă, se schimbă și ce vede Google. Nu scriem „sute de clienți
 * mulțumiți”, nu punem `aggregateRating` — n-avem recenzii reale, iar o notă
 * inventată e exact genul de lucru pentru care Google penalizează, pe bună
 * dreptate.
 *
 * `sameAs` primește doar conturile adevărate. Instagram lipsește dinadins cât
 * timp linkul din `site.ts` duce la pagina de start a rețelei, nu la contul
 * lui: un `sameAs` care nu-i aparține e o afirmație falsă despre identitate.
 */
export function StructuredData() {
  const zone = availableNeighborhoods();

  const date = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: site.name,
    jobTitle: site.role,
    url: site.url,
    image: `${site.url}${unprefixed(site.portraitSuit)}`,
    telephone: site.contact.phone,
    email: site.contact.email,
    description: site.intro,

    worksFor: {
      "@type": "RealEstateAgent",
      name: site.agency,
      url: "https://www.trimbitasu-estate.ro/",
    },

    address: {
      "@type": "PostalAddress",
      addressLocality: site.city,
      addressCountry: "RO",
    },

    // Unde chiar are ce vinde ACUM, nu unde a vândut vreodată. Aceeași sursă ca
    // harta și ca filtrele de pe /proprietati.
    areaServed: zone.map((nume) => ({ "@type": "Place", name: nume })),

    // Doar conturile reale — aceeași regulă ca în subsol. Vezi `realSocial`.
    sameAs: realSocial.map((cont) => cont.href),

    makesOffer: {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Intermediere imobiliară",
        areaServed: `${site.city} și Ilfov`,
      },
      // Afirmație verificabilă, scrisă pe fiecare anunț al agenției.
      description: "Comision 0% pentru cumpărător și pentru chiriaș.",
    },
  };

  return (
    <script
      type="application/ld+json"
      // Conținutul e construit din datele noastre, nu din input de la om, deci
      // nu poate injecta nimic. `JSON.stringify` scapă oricum ghilimelele;
      // `</script>` nu poate apărea, fiindcă niciun câmp nu conține HTML.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(date, null, 0) }}
    />
  );
}
