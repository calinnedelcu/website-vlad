"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cityPath, sectorPaths } from "@/lib/bucharest-shape";
import { cityCentre, mapSize, project, zoneCoords } from "@/lib/geo";
import { priceLabel, statusLabel, type Property } from "@/lib/properties";

/**
 * Harta portofoliului.
 *
 * Restul site-ului spune „București și Ilfov” și înșiră nume de cartiere. Un
 * om care nu cunoaște orașul nu are ce face cu lista aia, iar unul care îl
 * cunoaște trebuie oricum să și-o așeze singur în cap. Aici se vede dintr-o
 * privire ce e de fapt de spus: gros în vestul orașului, câteva în centru, iar
 * halele — dincolo de Centură.
 *
 * Punctele sunt ZONE, nu adrese. O zonă cu trei proprietăți e un punct mai
 * mare, nu trei puncte. Asta e și corect față de date (adresele exacte nu se
 * publică), și mai lizibil: șaptesprezece puncte se citesc, douăzeci
 * suprapuse, nu.
 *
 * Harta e stratul vizual; lista din dreapta e conținutul. Fără mouse, fără
 * JS și la citirea cu voce tare rămâne lista — completă, cu linkuri.
 *
 * Are două roluri, și e aceeași hartă în amândouă:
 *
 * - `editorial`, pe prima pagină: secțiune de sine stătătoare, cu titlu și cu
 *   panoul care înșiră proprietățile din zona aleasă. Aici harta spune ceva.
 * - `filter`, pe /proprietati: un control strâns, sub bara de filtre, legat la
 *   filtrul de zonă. Aici harta face ceva — dai pe un punct, se strânge grila
 *   de dedesubt. Cerut de Vlad: „sus de tot sub filtrare, să fie ca o
 *   filtrare”.
 *
 * Diferența de stare între ele: în modul editorial, zona aleasă e a hărții și
 * se pierde când pleci cu mouse-ul. În modul filtru, zona aleasă aparține
 * paginii — o ține bara de filtre, se vede în grilă și nu dispare la
 * `pointerleave`. De aia ce e sub cursor (`hovered`) și ce e ales (`selected`)
 * sunt două lucruri separate mai jos, deși în modul editorial coincid.
 */

interface PortfolioMapProps {
  properties: Property[];
  variant?: "editorial" | "filter";
  /** Doar în modul filtru: zona aleasă acum, ținută de părinte. */
  value?: string;
  /** Doar în modul filtru. Primește numele zonei sau „toate”. */
  onChange?: (zone: string) => void;
}

interface MapZone {
  name: string;
  x: number;
  y: number;
  items: Property[];
  /** Comercial și industrial se colorează diferit — e a doua meserie a lui. */
  commercial: boolean;
  /** Fapt administrativ, nu dedus din coordonate. Vezi `geo.ts`. */
  ilfov: boolean;
}

export function PortfolioMap({
  properties,
  variant = "editorial",
  value,
  onChange,
}: PortfolioMapProps) {
  const isFilter = variant === "filter";
  /** Ce e sub cursor acum. Se pierde la `pointerleave`, în ambele moduri. */
  const [hovered, setHovered] = useState<string | null>(null);

  const zones = useMemo<MapZone[]>(() => {
    const grouped = new Map<string, Property[]>();
    for (const property of properties) {
      // O zonă fără coordonate nu se poate desena. Nu inventăm o poziție:
      // proprietatea rămâne în portofoliu, doar că nu apare pe hartă.
      if (!zoneCoords[property.neighborhood]) continue;
      const list = grouped.get(property.neighborhood) ?? [];
      list.push(property);
      grouped.set(property.neighborhood, list);
    }

    return [...grouped.entries()]
      .map(([name, items]) => ({
        name,
        ...project(zoneCoords[name]),
        items,
        commercial: items.some((property) => property.segment === "comercial"),
        ilfov: zoneCoords[name].county === "ilfov",
      }))
      // Cele mari se desenează primele, ca punctele mici să rămână deasupra
      // și să poată fi apucate cu mouse-ul.
      .sort((a, b) => b.items.length - a.items.length);
  }, [properties]);

  /**
   * Zona aleasă. În modul editorial e chiar ce e sub cursor; în modul filtru
   * vine din bara de filtre și rămâne acolo până o schimbi.
   */
  const selected = isFilter ? (value && value !== "toate" ? value : null) : hovered;
  /** Ce se scrie pe etichetă: cursorul bate selecția, ca să poți iscodi harta. */
  const shown = zones.find((zone) => zone.name === (hovered ?? selected));
  const missing = properties.length - zones.reduce((n, zone) => n + zone.items.length, 0);
  const inIlfov = zones.filter((zone) => zone.ilfov).length;

  /** Un click pe un punct: alege zona în editorial, comută filtrul în filtru. */
  const pick = (name: string) => {
    if (isFilter) onChange?.(selected === name ? "toate" : name);
    else setHovered(name);
  };

  /* ---------- Harta propriu-zisă ----------
     Aceeași în ambele moduri. E scoasă într-o variabilă, nu într-o componentă
     separată, fiindcă are nevoie de tot ce s-a calculat mai sus și nu se
     folosește nicăieri altundeva. */
  const map = (
    <div
      className="relative w-full"
      style={{ aspectRatio: `${mapSize.width} / ${mapSize.height}` }}
      onPointerLeave={() => setHovered(null)}
    >
      {/* Conturul real al orașului și al celor șase sectoare, adus din
          OpenStreetMap de `scripts/fetch-geo.mjs`. Nimic desenat din memorie:
          pe o hartă care există tocmai ca să spună unde sunt lucrurile, o linie
          aproximativă e o minciună cu pretenții. */}
      <svg
        viewBox={`0 0 ${mapSize.width} ${mapSize.height}`}
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <radialGradient
            id="city-fill"
            gradientUnits="userSpaceOnUse"
            cx={cityCentre.x}
            cy={cityCentre.y}
            r={13}
          >
            <stop offset="0%" stopColor="var(--color-bronze-soft)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--color-bronze-soft)" stopOpacity="0.05" />
          </radialGradient>
        </defs>

        {/* Sectoarele, subțire: dau structură fără să concureze cu punctele.
            Se opresc la marginea orașului, ca desenul real. */}
        <g
          fill="none"
          stroke="var(--color-paper)"
          strokeOpacity="0.12"
          strokeWidth="0.05"
          strokeLinejoin="round"
        >
          {sectorPaths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        <path
          d={cityPath}
          fill="url(#city-fill)"
          stroke="var(--color-paper)"
          strokeOpacity="0.5"
          strokeWidth="0.1"
          strokeLinejoin="round"
        />
      </svg>

      {zones.map((zone) => {
        // Inelul se aprinde și pentru ce e sub cursor, și pentru zona aleasă.
        // În modul filtru sunt lucruri diferite: poți iscodi harta cu mouse-ul
        // fără să pierzi din ochi filtrul pe care l-ai pus.
        const on = hovered === zone.name || selected === zone.name;
        // Aria punctului crește cu numărul de proprietăți, nu raza — altfel
        // trei par de nouă ori mai multe decât una.
        const size = 12 + Math.sqrt(zone.items.length) * 7;

        return (
          <button
            key={zone.name}
            type="button"
            onPointerEnter={() => setHovered(zone.name)}
            onFocus={() => setHovered(zone.name)}
            onClick={() => pick(zone.name)}
            aria-label={`${zone.name}, ${zone.ilfov ? "Ilfov" : "București"} — ${
              zone.items.length
            } ${zone.items.length === 1 ? "proprietate" : "proprietăți"}`}
            aria-pressed={selected === zone.name}
            className="absolute grid place-items-center"
            style={{
              left: `${(zone.x / mapSize.width) * 100}%`,
              top: `${(zone.y / mapSize.height) * 100}%`,
              width: size,
              height: size,
              margin: `${-size / 2}px 0 0 ${-size / 2}px`,
            }}
          >
            {/* Inelul care se deschide la hover. Stă pe un element separat ca
                să nu se bată cu poziționarea punctului. */}
            <span
              className={`absolute inset-0 rounded-full border transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                on
                  ? "border-paper/70 scale-[1.9] opacity-100"
                  : "border-paper/0 scale-100 opacity-0"
              }`}
            />
            {/* Culoarea spune ce fel de proprietate e, umplerea spune de care
                parte a graniței administrative. Ilfovul rămâne gol pe dinăuntru
                — se citește imediat că e „în afară”, fără să desenăm o linie pe
                care n-o putem desena corect. */}
            <span
              className={`block h-full w-full rounded-full border-2 transition-colors duration-300 ${
                zone.commercial
                  ? "border-bronze-soft " + (zone.ilfov ? "bg-transparent" : "bg-bronze-soft")
                  : "border-paper " + (zone.ilfov ? "bg-transparent" : "bg-paper")
              } ${on ? "opacity-100" : "opacity-70"}`}
            />
          </button>
        );
      })}

      {/* Eticheta apare doar pentru zona activă: șaptesprezece nume desenate
          permanent s-ar călca în picioare. */}
      {shown && (
        <span
          className="bg-paper text-void pointer-events-none absolute translate-x-3 -translate-y-1/2 px-2 py-1 text-[0.6875rem] tracking-[0.08em] whitespace-nowrap uppercase"
          style={{
            left: `${(shown.x / mapSize.width) * 100}%`,
            top: `${(shown.y / mapSize.height) * 100}%`,
          }}
        >
          {shown.name}
          {shown.ilfov && <span className="text-void/50"> · Ilfov</span>}
        </span>
      )}
    </div>
  );

  /* ---------- Legenda ---------- */
  const legend = (
    <div className="border-void-line text-paper/45 flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-4 text-xs">
      <span className="flex items-center gap-2">
        <span className="bg-paper border-paper block h-2.5 w-2.5 rounded-full border-2" />
        Rezidențial
      </span>
      <span className="flex items-center gap-2">
        <span className="bg-bronze-soft border-bronze-soft block h-2.5 w-2.5 rounded-full border-2" />
        Comercial și industrial
      </span>
      <span className="flex items-center gap-2">
        <span className="border-paper block h-2.5 w-2.5 rounded-full border-2" />
        Ilfov
      </span>
      {/* Atribuirea nu e opțională: conturul e date OpenStreetMap sub ODbL.
          Nu o scoate. */}
      <span className="ml-auto">
        Contur:{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          className="link-underline"
        >
          OpenStreetMap
        </a>
      </span>
    </div>
  );

  /* ---------- Modul filtru ----------
     Un panou închis sub bara de filtre, nu o secțiune. Fără titlu și fără
     lista de proprietăți: rezultatul se vede în grila de dedesubt, care e
     chiar lista. Rămâne întunecat pe o pagină deschisă la culoare fiindcă
     toată harta e desenată cu alb pe negru — și fiindcă așa se citește ca un
     obiect, nu ca o pată în pagină. */
  if (isFilter) {
    return (
      <div id="harta" className="bg-void text-paper mt-10 p-5 md:p-8">
        <div className="grid gap-6 md:grid-cols-[minmax(0,20rem)_1fr] md:gap-12">
          <div className="mx-auto w-full max-w-[20rem] md:mx-0">{map}</div>

          <div className="flex flex-col">
            <p className="eyebrow text-paper/50">
              {selected ? "Zona aleasă" : "Alege zona de pe hartă"}
            </p>

            {selected ? (
              <div className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-2">
                <p className="font-display text-2xl leading-none">{selected}</p>
                <button
                  type="button"
                  onClick={() => onChange?.("toate")}
                  className="text-paper/40 hover:text-paper text-xs transition-colors duration-300"
                >
                  Toate zonele
                </button>
              </div>
            ) : (
              /* Explicația mărimii punctelor n-are ce căuta pe telefon: acolo
                 costă patru rânduri sub o hartă de 300px, iar cine se uită
                 vede oricum că punctele diferă. Rămâne de la `md` în sus,
                 unde e loc. */
              <p className="text-paper/55 mt-3 hidden max-w-[40ch] text-sm md:block">
                {zones.length - inIlfov} zone în București, {inIlfov} în Ilfov. Cu cât zona are mai
                multe proprietăți, cu atât punctul e mai mare.
              </p>
            )}

            {/* Pe telefon harta intră în ~300px, iar Cișmigiu și Grădina
                Icoanei sunt la 1,4 km unul de altul — vreo 15 pixeli. Nu se pot
                nimeri cu degetul, deci spunem pe față unde e calea sigură. */}
            <p className="text-paper/35 mt-3 max-w-[42ch] text-xs md:hidden">
              Punctele apropiate nu se nimeresc cu degetul — lista „Zonă” din filtre le are pe
              toate.
            </p>

            <div className="mt-5 md:mt-auto">{legend}</div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Modul editorial ---------- */
  return (
    <section id="harta" className="bg-void text-paper py-24 md:py-32">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-paper/50">Unde lucrez</p>
            <h2 className="display-md mt-3 max-w-[18ch]">Vestul orașului, și ce e dincolo de el</h2>
          </div>
          <p className="text-paper/45 max-w-[34ch] text-sm">
            {zones.length - inIlfov} zone în București, {inIlfov} în Ilfov. Punctele sunt zone, nu
            adrese — cu cât zona are mai multe proprietăți, cu atât punctul e mai mare.
          </p>
        </div>

        <div className="mt-14 grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-7">
            {map}
            <div className="mt-6">{legend}</div>
          </div>

          {/* ---------- Panoul ---------- */}
          {/* Harta poate să nu spună nimic cuiva care nu cunoaște orașul, deci
              tot ce arată ea trebuie să existe și în text. Dar lista completă
              nu are ce căuta în starea de repaus: șaptesprezece rânduri pe
              toată lățimea, sub o hartă, erau un zid — mai ales pe telefon,
              unde nu stau alături, ci unul sub altul. Implicit e strânsă
              într-un rând; cine vrea toate zonele o deschide. */}
          <div className="md:col-span-4 md:col-start-9">
            <div className="flex items-baseline justify-between gap-4">
              <p className="eyebrow text-paper/50">{shown ? shown.name : "Alege o zonă"}</p>

              {/* Ieșirea din zona aleasă. Pe mouse o face `pointerleave` de pe
                  hartă, dar la atingere evenimentul ăla nu vine niciodată:
                  fără butonul ăsta, cine deschide o zonă pe telefon rămâne
                  blocat în ea, fără drum înapoi la listă. */}
              {shown && (
                <button
                  type="button"
                  onClick={() => setHovered(null)}
                  className="text-paper/40 hover:text-paper shrink-0 text-xs transition-colors duration-300"
                >
                  Toate zonele
                </button>
              )}
            </div>

            {shown ? (
              <ul className="border-void-line mt-5 border-t">
                {shown.items.map((property) => (
                  <li key={property.slug}>
                    <Link
                      href={`/proprietati/${property.slug}`}
                      className="border-void-line group block border-b py-4"
                    >
                      <p className="font-display group-hover:text-bronze-soft text-xl leading-tight transition-colors duration-300">
                        {property.title}
                      </p>
                      <p className="text-paper/45 nums mt-1 text-sm">
                        {property.status === "disponibil"
                          ? priceLabel(property)
                          : statusLabel[property.status]}{" "}
                        · {property.specs.surface} mp
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <>
                {/* „sau din listă” nu e o formulă de politețe: pe telefon,
                    harta intră în ~335px, iar Cișmigiu și Grădina Icoanei sunt
                    la 1,4 km unul de altul — adică vreo 17 pixeli. Punctele nu
                    se pot nimeri cu degetul la scara aia, deci lista de mai jos
                    e calea adevărată acolo, nu o variantă de rezervă. */}
                <p className="text-paper/55 mt-5 text-sm">
                  Alege o zonă, de pe hartă sau din listă, și îți arăt ce am acolo.
                </p>

                {/* `<details>` nativ: se deschide fără JS, e în ordinea de
                    tabulare și anunță singur starea. Nu avem nevoie de stare
                    în React pentru o listă care doar se pliază. */}
                <details className="group mt-6">
                  <summary className="border-void-line hover:text-bronze-soft flex cursor-pointer list-none items-center justify-between border-t border-b py-3 text-sm transition-colors duration-300 [&::-webkit-details-marker]:hidden">
                    Toate zonele
                    <span className="nums text-paper/40 group-open:hidden">{zones.length}</span>
                    <span className="text-paper/40 hidden group-open:inline">Închide</span>
                  </summary>

                  <ul className="max-h-[19rem] overflow-y-auto">
                    {zones.map((zone) => (
                      <li key={zone.name}>
                        <button
                          type="button"
                          onPointerEnter={() => setHovered(zone.name)}
                          onFocus={() => setHovered(zone.name)}
                          onClick={() => setHovered(zone.name)}
                          className="border-void-line hover:text-bronze-soft flex w-full items-baseline justify-between border-b py-2.5 text-left text-sm transition-colors duration-300"
                        >
                          <span>{zone.name}</span>
                          <span className="nums text-paper/40">{zone.items.length}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </details>
              </>
            )}

            {missing > 0 && (
              <p className="text-paper/35 mt-5 text-xs">
                {missing} {missing === 1 ? "proprietate nu apare" : "proprietăți nu apar"} pe hartă
                — zona lor n-are încă un reper.
              </p>
            )}

            <Link href="/proprietati" className="link-underline mt-8 inline-block text-sm">
              Vezi tot portofoliul
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
