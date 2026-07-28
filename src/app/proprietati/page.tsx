import type { Metadata } from "next";
import { Photo } from "@/components/Photo";
import { PortfolioBrowser } from "@/components/PortfolioBrowser";
import { PortfolioMap } from "@/components/PortfolioMap";
import { SplitReveal } from "@/components/SplitReveal";
import { availableNeighborhoods, availableProperties, properties } from "@/lib/properties";

export const metadata: Metadata = {
  title: "Proprietăți",
  description:
    "Apartamente, hale industriale și spații comerciale în București și Ilfov — de vânzare și de închiriat, din portofoliul lui Vlad Nedelcu.",
};

export default function PropertiesPage() {
  // Fundalul capului de pagină — o fotografie din portofoliu, ținută foarte
  // în spate. Nu concurează cu grila de dedesubt, doar dă adâncime.
  const available = availableProperties();
  const backdrop = available[0]?.media.cover;

  return (
    <>
      <section
        data-dark-hero
        className="bg-void text-paper relative isolate -mt-20 overflow-hidden"
      >
        {backdrop && (
          <Photo
            src={backdrop}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
        )}
        <div className="scrim-hero pointer-events-none absolute inset-0" />

        <div className="shell relative pt-36 pb-16 md:pt-44 md:pb-24">
          <p className="eyebrow text-paper/55">Portofoliu</p>
          <div className="mt-6 grid gap-10 md:grid-cols-12 md:items-end">
            <SplitReveal as="h1" className="display-lg md:col-span-7" immediate>
              Proprietăți în București și Ilfov
            </SplitReveal>
            <p className="text-paper/70 md:col-span-4 md:col-start-9">
              Apartamente de vânzare și de închiriat, hale industriale și spații comerciale.
              Comision 0% pentru cumpărător și pentru chiriaș, pe toate.
            </p>
          </div>
        </div>
      </section>

      <section className="shell pb-20 md:pb-28">
        <PortfolioBrowser properties={available} neighborhoods={[...availableNeighborhoods()]} />
      </section>

      {/* Harta a stat pe prima pagină, unde arăta bine și nu ducea nicăieri.
          Aici e la locul ei: omul tocmai a trecut prin listă și filtre, iar
          harta îi spune ce nu spune nicio filtrare — unde sunt lucrurile astea
          unele față de altele. Primește tot portofoliul, nu doar ce e liber
          acum: e o hartă a zonelor în care lucrează, nu un al doilea filtru. */}
      <PortfolioMap properties={properties} />
    </>
  );
}
