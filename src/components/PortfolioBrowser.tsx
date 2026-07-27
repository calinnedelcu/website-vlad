"use client";

import { useMemo, useState } from "react";
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

  const results = useMemo(
    () =>
      properties.filter((p) => {
        if (deal !== "toate" && p.deal !== deal) return false;
        if (segment !== "toate" && p.segment !== segment) return false;
        if (neighborhood !== "toate" && p.neighborhood !== neighborhood) return false;
        return true;
      }),
    [properties, deal, segment, neighborhood],
  );

  return (
    <>
      {/* Bara de filtre rămâne lipită sub header cât derulezi grila. Marginile
          negative anulează padding-ul lui `shell`, ca fundalul să meargă pe
          toată lățimea — altfel cardurile s-ar vedea pe sub el, pe margini. */}
      <div className="bg-paper/92 border-line sticky top-20 z-30 -mx-5 border-b px-5 py-6 backdrop-blur-md md:-mx-10 md:px-10 xl:-mx-16 xl:px-16">
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

        <p className="text-muted mt-6 text-sm">
          {results.length}{" "}
          {results.length === 1 ? "proprietate" : results.length < 20 ? "proprietăți" : "de proprietăți"}
        </p>
      </div>

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
