import type { Metadata } from "next";
import { Photo } from "@/components/Photo";
import { PropertyIndexList } from "@/components/PropertyIndexList";
import { SplitReveal } from "@/components/SplitReveal";
import { soldProperties } from "@/lib/properties";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tranzacții",
  description:
    "Proprietăți intermediate de Vlad Nedelcu în București și Ilfov — apartamente și garsoniere vândute, cu fotografiile și descrierile lor.",
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
          <p className="eyebrow text-paper/55">Track record</p>
          <div className="mt-6 grid gap-10 md:grid-cols-12 md:items-end">
            <SplitReveal as="h1" className="display-lg md:col-span-7" immediate>
              Proprietăți intermediate
            </SplitReveal>
            <p className="text-paper/70 md:col-span-4 md:col-start-9">
              Rămân pe site după tranzacție. E singura dovadă care contează. Prețurile sunt cele
              cerute la listare — cele de vânzare nu se publică.
            </p>
          </div>
        </div>
      </section>

      {/* Un registru, nu o vitrină: aici nimeni nu cumpără, deci lista bate
          grila de carduri. Fotografia apare la hover, pentru cine vrea. */}
      <PropertyIndexList
        properties={sold}
        eyebrow="Registru"
        title="Ce a trecut prin mâna mea"
        note="Selecția de mai jos e cea aleasă de Vlad. Istoricul complet, cu toate tranzacțiile trecute prin el, e ținut de agenție."
        linkHref={site.transactionsUrl}
        linkLabel="Istoricul complet, pe site-ul agenției"
      />
    </>
  );
}
