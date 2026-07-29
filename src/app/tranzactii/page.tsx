import type { Metadata } from "next";
import { Photo } from "@/components/Photo";
import { PropertyCard } from "@/components/PropertyCard";
import { Reveal } from "@/components/Reveal";
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

      {/* Aici era o listă de rânduri, fără nicio fotografie — cu una singură
          care urmărea cursorul, deci numai pe desktop și numai la hover. Pe
          telefon, unde se uită cei mai mulți, pagina asta era text pe text.
          Cerut de Vlad: poze. Și are dreptate — proprietățile vândute sunt
          singura lui dovadă, iar o dovadă pe care n-o vezi nu dovedește nimic.
          Aceleași carduri ca pe /proprietati, care știu deja să arate o
          proprietate încheiată: fotografia se decolorează, prețul se taie,
          eticheta „vândut” stă în colț. */}
      <section className="shell py-20 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal>
              <p className="eyebrow">Registru</p>
            </Reveal>
            <SplitReveal className="display-md mt-3">Ce a trecut prin mâna mea</SplitReveal>
            <Reveal delay={120}>
              <p className="text-muted mt-4 max-w-[46ch] text-sm">
                Selecția de mai jos e cea aleasă de Vlad. Istoricul complet, cu toate tranzacțiile
                trecute prin el, e ținut de agenție.
              </p>
            </Reveal>
          </div>
          <Reveal delay={160}>
            <a
              href={site.transactionsUrl}
              target="_blank"
              rel="noreferrer"
              className="link-underline text-sm"
            >
              Istoricul complet, pe site-ul agenției
            </a>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-x-10 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
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
