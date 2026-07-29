"use client";

import { useMemo, useState } from "react";
import { PortfolioMap } from "./PortfolioMap";
import { PropertyCard } from "./PropertyCard";
import type { Deal, Property, Segment } from "@/lib/properties";

type DealFilter = Deal | "toate";
type SegmentFilter = Segment | "toate";

const dealOptions: { value: DealFilter; label: string }[] = [
  { value: "toate", label: "Toate" },
  { value: "vanzare", label: "De vânzare" },
  { value: "inchiriere", label: "De închiriat" },
];

const segmentOptions: { value: SegmentFilter; label: string }[] = [
  { value: "toate", label: "Toate" },
  { value: "rezidential", label: "Rezidențial" },
  { value: "comercial", label: "Comercial" },
];

interface PortfolioBrowserProps {
  properties: Property[];
  neighborhoods: string[];
}

export function PortfolioBrowser({ properties, neighborhoods }: PortfolioBrowserProps) {
  const [deal, setDeal] = useState<DealFilter>("toate");
  const [segment, setSegment] = useState<SegmentFilter>("toate");
  const [neighborhood, setNeighborhood] = useState("toate");
  /**
   * Doar pe telefon. Bara e lipită sub header, iar desfășurată ocupa ~250px
   * din ecran tot timpul cât derulai grila — cu header cu tot, aproape 340
   * dintr-un ecran de 844. Adică patruzeci la sută din telefon ținut de niște
   * filtre pe care le pui o dată.
   */
  const [showFilters, setShowFilters] = useState(false);

  /**
   * Tot ce trece de celelalte două filtre, înainte de a alege zona.
   *
   * Harta primește lista asta, nu rezultatul final: dacă i-am da rezultatul,
   * în clipa în care alegi o zonă harta ar rămâne cu un singur punct și n-ai
   * mai avea de unde alege alta. Așa, harta arată exact zonele în care chiar ai
   * ce găsi cu filtrele puse acum — deci niciun punct nu duce în gol.
   */
  const inZoneScope = useMemo(
    () =>
      properties.filter((p) => {
        if (deal !== "toate" && p.deal !== deal) return false;
        if (segment !== "toate" && p.segment !== segment) return false;
        return true;
      }),
    [properties, deal, segment],
  );

  const results = useMemo(
    () =>
      inZoneScope.filter((p) => neighborhood === "toate" || p.neighborhood === neighborhood),
    [inZoneScope, neighborhood],
  );

  const active = [deal !== "toate", segment !== "toate", neighborhood !== "toate"].filter(
    Boolean,
  ).length;

  const count = `${results.length} ${
    results.length === 1 ? "proprietate" : results.length < 20 ? "proprietăți" : "de proprietăți"
  }`;

  return (
    <>
      {/* Bara de filtre rămâne lipită sub header cât derulezi grila. Marginile
          negative anulează padding-ul lui `shell`, ca fundalul să meargă pe
          toată lățimea — altfel cardurile s-ar vedea pe sub el, pe margini. */}
      <div className="bg-paper/92 border-line sticky top-20 z-30 -mx-5 border-b px-5 backdrop-blur-md md:-mx-10 md:px-10 xl:-mx-16 xl:px-16">
        {/* Rândul strâns, doar pe telefon: un buton și numărul de rezultate.
            Numărul rămâne mereu la vedere — el e singurul lucru din bară care
            se schimbă singur, deci și singurul care trebuie văzut tot timpul.
            Restul se deschide la cerere. De la `md` în sus filtrele încap pe un
            rând, deci n-are ce strânge. */}
        <div className="flex items-center justify-between gap-4 py-4 md:hidden">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            aria-controls="filtre"
            className="border-line flex items-center gap-2.5 border px-4 py-2.5 text-sm"
          >
            {showFilters ? "Ascunde filtrele" : "Filtre"}
            {active > 0 && (
              <span className="bg-ink text-paper nums grid h-5 w-5 place-items-center rounded-full text-[0.6875rem]">
                {active}
              </span>
            )}
          </button>
          <p className="text-muted text-sm">{count}</p>
        </div>

        <div
          id="filtre"
          className={`pb-6 md:block md:py-6 ${showFilters ? "block" : "hidden"}`}
        >
          <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
            <FilterGroup label="Tranzacție" options={dealOptions} value={deal} onChange={setDeal} />
            <FilterGroup label="Tip" options={segmentOptions} value={segment} onChange={setSegment} />

            <div>
              <p className="eyebrow mb-2.5">Zonă</p>
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="border-line focus:border-ink cursor-pointer border-b bg-transparent pr-6 pb-1 text-sm outline-none"
              >
                <option value="toate">Toate zonele</option>
                {neighborhoods.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-muted mt-6 hidden text-sm md:block">{count}</p>
        </div>
      </div>

      {/* Harta, ca filtru de zonă. Cerut de Vlad: „sus de tot sub filtrare, să
          fie ca o filtrare”. Nu e o a doua hartă, e aceeași componentă în
          celălalt mod — vezi PortfolioMap. Dai pe un punct, se strânge grila de
          dedesubt; dai a doua oară pe același punct, revii la toate zonele. */}
      <PortfolioMap
        properties={inZoneScope}
        variant="filter"
        value={neighborhood}
        onChange={setNeighborhood}
      />

      {results.length > 0 ? (
        <div className="mt-14 grid gap-x-10 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((property, i) => (
            <PropertyCard
              key={property.slug}
              property={property}
              index={i + 1}
              delay={(i % 3) * 100}
              priority={i < 3}
            />
          ))}
        </div>
      ) : (
        <div className="border-line mt-12 border-t py-24 text-center">
          <p className="display-sm">Nimic pe filtrele astea.</p>
          <p className="text-muted mx-auto mt-3 max-w-[40ch] text-sm">
            Portofoliul se schimbă des. Scrie-mi ce cauți și îți spun dacă am ceva pe drum.
          </p>
        </div>
      )}
    </>
  );
}

function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="eyebrow mb-2.5">{label}</p>
      <div className="flex gap-5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={`border-b pb-1 text-sm transition-colors ${
              value === option.value
                ? "border-ink text-ink"
                : "text-muted hover:text-ink border-transparent"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
