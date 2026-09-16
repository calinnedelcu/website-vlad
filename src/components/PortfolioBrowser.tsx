"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

  /**
   * Cât trebuie să cobori ca să se închidă filtrele singure.
   *
   * Nu zero: la deschidere, bara crește și pe un telefon scund partea de jos a
   * panoului poate ajunge sub pliu — cine dă puțin în jos ca să vadă lista
   * „Zonă” n-are de ce să rămână fără filtre în mână. Patruzeci și opt de
   * pixeli sunt mai mult decât o ajustare și mai puțin decât o derulare.
   */
  const CLOSE_AFTER = 48;

  const barRef = useRef<HTMLDivElement>(null);

  /**
   * Filtrele se închid singure când începi să derulezi prin rezultate.
   *
   * Reclamat de Vlad: deschise, rămâneau lipite peste tot ecranul cât citea
   * lista. Butonul de închidere e acum vizibil, dar tot îi cerea un gest în
   * plus pentru ceva ce se înțelege de la sine — te-ai uitat la filtre, ai
   * plecat mai departe.
   *
   * DOAR ÎN JOS. Dacă s-ar închide și la derulare în sus, ar dispărea exact
   * când cineva urcă puțin ca să ajungă la capătul de sus al panoului.
   *
   * Saltul: bara se strânge cu ~250px, iar tot ce e sub ea urcă. Browserele
   * moderne au ancorare de derulare și compensează singure, dar nu toate —
   * de aceea măsurăm înălțimea înainte și după și punem noi diferența înapoi.
   */
  useEffect(() => {
    if (!showFilters) return;

    const start = window.scrollY;
    const onScroll = () => {
      if (window.scrollY - start < CLOSE_AFTER) return;

      const inainte = barRef.current?.getBoundingClientRect().height ?? 0;
      setShowFilters(false);

      // După ce React a randat bara strânsă, punem la loc cât s-a scurtat.
      requestAnimationFrame(() => {
        const dupa = barRef.current?.getBoundingClientRect().height ?? 0;
        const diferenta = Math.round(inainte - dupa);
        if (diferenta > 1) window.scrollBy({ top: -diferenta, behavior: "instant" });
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showFilters]);

  const count = `${results.length} ${
    results.length === 1 ? "proprietate" : results.length < 20 ? "proprietăți" : "de proprietăți"
  }`;

  return (
    <>
      {/* Bara de filtre rămâne lipită sub header cât derulezi grila. Marginile
          negative anulează padding-ul lui `shell`, ca fundalul să meargă pe
          toată lățimea — altfel cardurile s-ar vedea pe sub el, pe margini. */}
      <div
        ref={barRef}
        className="bg-paper/92 border-line sticky top-20 z-30 -mx-5 border-b px-5 backdrop-blur-md md:-mx-10 md:px-10 xl:-mx-16 xl:px-16"
      >
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
            /* Deschis, butonul se inversează: cerneală plină, text deschis, cu
               un X. Închis, e doar conturat.

               Reclamat de Vlad: cu panoul deschis, derulatul ținea filtrele pe
               tot ecranul și nu se vedea cum scapi de ele. Butonul exista, dar
               arăta exact la fel ca atunci când e închis — se schimba doar
               textul. Un buton care nu-și arată starea nu e o ieșire, e o
               etichetă.

               `cursor-pointer` nu e de prisos: Tailwind v4 pune `cursor:
               default` pe butoane, deci nici măcar cursorul nu spunea că e
               apăsabil. */
            className={`flex cursor-pointer items-center gap-2.5 border px-4 py-2.5 text-sm transition-colors duration-300 ${
              showFilters ? "bg-ink border-ink text-paper" : "border-line"
            }`}
          >
            {showFilters ? "Ascunde filtrele" : "Filtre"}
            {showFilters ? (
              <svg
                viewBox="0 0 24 24"
                aria-hidden
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="square"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              /* Câte filtre sunt puse. Doar în starea închisă: deschis, se văd
                 oricum, iar X-ul e mai util decât o cifră. */
              active > 0 && (
                <span className="bg-ink text-paper nums grid h-5 w-5 place-items-center rounded-full text-[0.6875rem]">
                  {active}
                </span>
              )
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
