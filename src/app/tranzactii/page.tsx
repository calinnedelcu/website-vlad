import type { Metadata } from "next";
import { openGraphBase } from "@/lib/metadata";
import { site } from "@/lib/site";
import { Photo } from "@/components/Photo";
import { PropertyCard } from "@/components/PropertyCard";
import { SplitReveal } from "@/components/SplitReveal";
import { soldProperties } from "@/lib/properties";

export const metadata: Metadata = {
  title: "Tranzacții",
  description:
    "Proprietăți intermediate de Vlad Nedelcu în București și Ilfov — apartamente și garsoniere vândute, cu fotografiile și descrierile lor.",
  alternates: { canonical: "/tranzactii/" },
  openGraph: {
    ...openGraphBase,
    url: "/tranzactii/",
    title: `${site.name} — Tranzacții`,
    description: "Proprietăți intermediate de Vlad Nedelcu în București și Ilfov — apartamente și garsoniere vândute, cu fotografiile și descrierile lor.",
  },
};

export default function TransactionsPage() {
  const sold = soldProperties();
  const backdrop = sold[0]?.media.cover;

  return (
    <>
      <section data-dark-hero className="bg-void text-paper relative isolate -mt-20 overflow-hidden">
        {backdrop && (
          <Photo
            src={backdrop}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-25"
          />
        )}
        <div className="scrim-hero pointer-events-none absolute inset-0" />

        <div className="shell relative pt-36 pb-16 md:pt-44 md:pb-24">
          {/* Eticheta „Track record" a plecat de aici, ca și de pe prima
              pagină: „Proprietăți intermediate” spune deja despre ce e vorba,
              iar eticheta o spunea încă o dată, în engleză. */}
          {/* Lângă titlu era un paragraf: „Rămân pe site după tranzacție. E
              singura dovadă care contează. Prețurile sunt cele cerute la
              listare — cele de vânzare nu se publică.” Scos de Calin. Grila pe
              douăsprezece coloane a plecat odată cu el: exista doar ca să-l
              așeze lângă titlu. */}
          <SplitReveal as="h1" className="display-lg max-w-[14ch]" immediate>
            Proprietăți intermediate
          </SplitReveal>
        </div>
      </section>

      {/* Aici era o listă de rânduri, fără nicio fotografie — cu una singură
          care urmărea cursorul, deci numai pe desktop și numai la hover. Pe
          telefon, unde se uită cei mai mulți, pagina asta era text pe text.
          Cerut de Vlad: poze. Și are dreptate — proprietățile vândute sunt
          singura lui dovadă, iar o dovadă pe care n-o vezi nu dovedește nimic.
          Aceleași carduri ca pe /proprietati, care știu deja să arate o
          proprietate încheiată: fotografia se decolorează, prețul se taie,
          eticheta „vândut” stă în colț. */}
      <section className="shell py-20 md:py-28">
        {/* Aici era antetul secțiunii: eticheta „Registru”, titlul „Ce a
            trecut prin mâna mea”, o notă care spunea că selecția e aleasă de
            Vlad, și linkul către istoricul complet de pe site-ul agenției.
            Scos de Calin — titlul paginii, „Proprietăți intermediate”, spunea
            deja același lucru cu două ecrane mai sus.

            Ce a plecat odată cu el: singurul link de pe site către istoricul
            complet al agenției (`site.transactionsUrl`, acum nefolosit), și
            precizarea că cele opt de aici sunt o selecție, nu tot. Pagina nu
            pretinde nicăieri că le arată pe toate, deci nu minte — dar nici nu
            mai spune unde se văd restul. */}
        {/* Fără `mt-14`: marginea aia îl despărțea de antetul de deasupra, care
            nu mai există. Acum grila e primul lucru din secțiune, iar
            distanța o dă `py-20` de pe ea. */}
        <div className="grid gap-x-10 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
          {sold.map((property, i) => (
            <PropertyCard
              key={property.slug}
              property={property}
              index={i + 1}
              delay={(i % 3) * 100}
              priority={i < 3}
            />
          ))}
        </div>
      </section>
    </>
  );
}
