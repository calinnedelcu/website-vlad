import Image from "next/image";
import Link from "next/link";
import { priceLabel, statusLabel, type Property } from "@/lib/properties";
import { Reveal } from "./Reveal";

interface PropertyCardProps {
  property: Property;
  /** Prima poziție dintr-un rând primește imagine mai înaltă — ritm editorial. */
  tall?: boolean;
  delay?: number;
  priority?: boolean;
  /** Numărul afișat peste fotografie. Dă senzația de catalog, nu de listă. */
  index?: number;
  /** Pe fundal închis inversăm cerneala. */
  dark?: boolean;
}

export function PropertyCard({
  property,
  tall,
  delay = 0,
  priority,
  index,
  dark,
}: PropertyCardProps) {
  const sold = property.status === "vandut" || property.status === "inchiriat";

  return (
    <Reveal delay={delay}>
      <Link href={`/proprietati/${property.slug}`} className="group block">
        <div className={`relative overflow-hidden ${tall ? "aspect-[3/4]" : "aspect-[4/3]"}`}>
          <Image
            src={property.media.cover}
            alt={property.title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw"
            className={`media-zoom object-cover ${sold ? "grayscale-[0.4]" : ""}`}
          />

          {/* Scrim discret: ține numărul și eticheta lizibile pe orice fotografie. */}
          <div className="scrim-soft pointer-events-none absolute inset-0 opacity-70" />
          {(index !== undefined || property.status !== "disponibil") && (
            <div className="scrim-top pointer-events-none absolute inset-0" />
          )}

          {index !== undefined && (
            <span className="text-paper absolute top-5 left-5 text-xs tracking-[0.2em]">
              {String(index).padStart(2, "0")}
            </span>
          )}

          {property.status !== "disponibil" && (
            <span className="bg-paper/95 text-ink absolute top-5 right-5 px-3 py-1.5 text-[0.6875rem] font-medium tracking-[0.14em] uppercase">
              {statusLabel[property.status]}
            </span>
          )}

          {/* Bara care se trage pe toată lățimea la hover — semnalul că e un link,
              fără să adăugăm un buton peste fotografie. */}
          <span className="bg-bronze absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
        </div>

        <div className="mt-5">
          <div className="flex items-baseline justify-between gap-4">
            <p className="eyebrow">
              {property.neighborhood} — {property.kind}
            </p>
            <p
              className={`shrink-0 text-sm ${
                sold ? "text-muted line-through" : dark ? "text-paper" : "text-ink"
              }`}
            >
              {priceLabel(property)}
            </p>
          </div>

          <h3
            className={`display-sm mt-2 transition-colors duration-500 ${
              dark ? "group-hover:text-bronze-soft" : "group-hover:text-bronze"
            }`}
          >
            {property.title}
          </h3>

          <p className={`mt-2 text-sm ${dark ? "text-paper/60" : "text-muted"}`}>
            {property.tagline}
          </p>

          <div
            className={`mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 border-t pt-4 text-sm ${
              dark ? "border-void-line text-paper/60" : "border-line text-muted"
            }`}
          >
            <span>{property.specs.surface} mp</span>
            {property.specs.rooms && <span>{property.specs.rooms} camere</span>}
            {property.specs.land && <span>teren {property.specs.land} mp</span>}
            {property.specs.year && <span>{property.specs.year}</span>}
          </div>
        </div>
      </Link>
    </Reveal>
  );
}
