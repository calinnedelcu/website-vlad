import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/Gallery";
import { ParallaxImage } from "@/components/ParallaxImage";
import { Reveal } from "@/components/Reveal";
import { SplitReveal } from "@/components/SplitReveal";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyStickyBar } from "@/components/PropertyStickyBar";
import {
  getProperty,
  priceLabel,
  properties,
  segmentLabel,
  statusLabel,
  type Property,
} from "@/lib/properties";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = getProperty(slug);
  if (!property) return {};

  return {
    title: `${property.title} — ${property.neighborhood}`,
    description: property.tagline,
    openGraph: {
      title: `${property.title} — ${property.neighborhood}`,
      description: property.tagline,
      images: [property.media.cover],
    },
  };
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = getProperty(slug);
  if (!property) notFound();

  const sold = property.status === "vandut" || property.status === "inchiriat";
  const others = properties.filter((p) => p.slug !== property.slug && !p.soldNote).slice(0, 3);

  return (
    <>
      <PropertyStickyBar property={property} />

      {/* ---------- Deschidere: fotografia pe tot ecranul, titlul peste ea ----------
          Aceeași logică ca pe home — pe o pagină de proprietate, primul lucru
          care trebuie să se vadă e proprietatea. */}
      <section
        data-dark-hero
        className="bg-void text-paper relative isolate -mt-20 flex h-[92svh] min-h-[34rem] w-full flex-col overflow-hidden"
      >
        <Image
          src={property.media.cover}
          alt={property.title}
          fill
          priority
          sizes="100vw"
          className={`ken-burns object-cover ${sold ? "grayscale-[0.3]" : ""}`}
        />
        <div className="scrim-hero pointer-events-none absolute inset-0" />

        <div className="shell relative flex h-full flex-col pt-28 pb-10 md:pb-14">
          <Link href="/proprietati" className="link-underline text-paper/70 text-sm">
            ← Portofoliu
          </Link>

          <div className="mt-auto">
            <p className="eyebrow text-paper/60">
              {property.neighborhood} · {segmentLabel[property.segment]} ·{" "}
              {statusLabel[property.status]}
            </p>
            <SplitReveal as="h1" className="display-lg mt-4 max-w-[18ch]" immediate>
              {property.title}
            </SplitReveal>
            <p className="lede text-paper/80 mt-5 max-w-[46ch]">{property.tagline}</p>

            <div className="border-paper/20 mt-10 flex flex-wrap items-end justify-between gap-x-10 gap-y-5 border-t pt-6">
              <div>
                <p className={`display-sm ${sold ? "text-paper/50 line-through" : ""}`}>
                  {priceLabel(property)}
                </p>
                {property.soldNote && (
                  <p className="text-paper/60 mt-2 text-sm">{property.soldNote}</p>
                )}
              </div>
              <div className="text-paper/70 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                <span>{property.specs.surface} mp</span>
                {property.specs.rooms && <span>{property.specs.rooms} camere</span>}
                {property.specs.land && <span>teren {property.specs.land} mp</span>}
                {property.specs.year && <span>{property.specs.year}</span>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Specificații + poveste ---------- */}
      <section className="shell py-20 md:py-28">
        <div className="grid gap-16 md:grid-cols-12">
          {/* Coloana lipicioasă cu date și CTA */}
          <aside className="md:col-span-4">
            <div className="md:sticky md:top-32">
              <Reveal>
                <dl className="border-line border-t">
                  <Spec label="Suprafață" value={`${property.specs.surface} mp`} />
                  {property.specs.land && <Spec label="Teren" value={`${property.specs.land} mp`} />}
                  {property.specs.rooms && <Spec label="Camere" value={String(property.specs.rooms)} />}
                  {property.specs.baths && <Spec label="Băi" value={String(property.specs.baths)} />}
                  {property.specs.floor && <Spec label="Etaj" value={property.specs.floor} />}
                  {property.specs.year && <Spec label="An construcție" value={String(property.specs.year)} />}
                  {property.specs.parking && (
                    <Spec label="Parcare" value={`${property.specs.parking} locuri`} />
                  )}
                  <Spec label="Zonă" value={property.area} />
                </dl>
              </Reveal>

              {!sold && (
                <Reveal delay={120}>
                  <div className="mt-8 flex flex-col gap-3">
                    <a
                      href={site.contact.whatsapp}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-ink text-paper hover:bg-bronze px-6 py-4 text-center text-sm transition-colors duration-300"
                    >
                      Programează o vizionare
                    </a>
                    <a
                      href={site.contact.phoneHref}
                      className="border-ink hover:bg-ink hover:text-paper border px-6 py-4 text-center text-sm transition-colors duration-300"
                    >
                      {site.contact.phone}
                    </a>
                  </div>
                  <p className="text-muted mt-4 text-xs">
                    {property.exclusive ? "Proprietate în exclusivitate. " : ""}Comision 0% pentru
                    {property.deal === "vanzare" ? " cumpărător" : " chiriaș"}.
                  </p>
                </Reveal>
              )}
            </div>
          </aside>

          {/* Textul editorial */}
          <div className="md:col-span-7 md:col-start-6">
            {property.story.map((paragraph, i) => (
              <Reveal key={i} delay={i * 80}>
                <p
                  className={
                    i === 0
                      ? "font-display text-2xl leading-snug md:text-[2rem]"
                      : "text-ink-soft mt-6 text-[1.0625rem] leading-relaxed"
                  }
                >
                  {paragraph}
                </p>
              </Reveal>
            ))}

            <Reveal delay={100}>
              <ul className="border-line mt-12 border-t">
                {property.highlights.map((item) => (
                  <li key={item} className="border-line text-ink-soft border-b py-4 text-sm">
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Respirație: o fotografie pe toată lățimea, cu parallax ---------- */}
      {property.media.gallery[0] && (
        <Reveal variant="image" className="h-[55vh] w-full md:h-[80vh]">
          <ParallaxImage
            src={property.media.gallery[0]}
            alt={property.title}
            className="h-full w-full"
          />
        </Reveal>
      )}

      {/* ---------- Galerie ---------- */}
      {property.media.gallery.length > 0 && (
        <section className="shell pb-20 md:pb-28">
          <Reveal>
            <p className="eyebrow border-line border-t pt-8">Galerie</p>
          </Reveal>
          <div className="mt-10">
            <Gallery images={property.media.gallery} title={property.title} />
          </div>
        </section>
      )}

      {/* ---------- Tur 3D / video ---------- */}
      {(property.media.tour3d || property.media.video) && (
        <section className="shell pb-20 md:pb-28">
          <Reveal>
            <p className="eyebrow border-line border-t pt-8">Tur virtual</p>
          </Reveal>
          <Reveal delay={100}>
            <div className="bg-paper-deep border-line mt-10 flex aspect-video items-center justify-center border">
              {/* Slot pentru embed Matterport / Kuula / player Mux. */}
              <p className="text-muted px-6 text-center text-sm">
                Aici intră turul 3D și filmarea proprietății.
              </p>
            </div>
          </Reveal>
        </section>
      )}

      {/* ---------- În jur ---------- */}
      <section className="shell pb-20 md:pb-28">
        <Reveal>
          <p className="eyebrow border-line border-t pt-8">În jur</p>
          <h2 className="display-md mt-5 max-w-[20ch]">Ce ai la câteva minute distanță</h2>
        </Reveal>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {property.nearby.map((item, i) => (
            <Reveal key={item.label} delay={i * 100}>
              <div className="border-line border-t pt-6">
                <p className="display-sm">{item.label}</p>
                <p className="text-muted mt-2 text-sm">{item.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Alte proprietăți ---------- */}
      {others.length > 0 && (
        <section className="shell">
          <Reveal>
            <p className="eyebrow border-line border-t pt-8">Poate te interesează și</p>
          </Reveal>
          <div className="mt-12 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((other: Property, i) => (
              <PropertyCard key={other.slug} property={other} index={i + 1} delay={i * 100} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-line flex items-baseline justify-between gap-4 border-b py-3.5">
      <dt className="eyebrow">{label}</dt>
      <dd className="text-right text-sm">{value}</dd>
    </div>
  );
}
