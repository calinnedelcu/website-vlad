"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
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

/** O proprietate vândută sau închiriată — dovada de track record, nu ofertă. */
const isSold = (p: Property) => p.status === "vandut" || p.status === "inchiriat";

/**
 * Bottom sheet pentru lista proprietăților dintr-o zonă, pe telefon.
 *
 * Modeled după lightbox-ul din `Gallery`: backdrop care închide la click,
 * `role="dialog"`, scroll-lock (în componenta părinte). Animația e pe
 * `transform: translateY`, cu easing-ul site-ului. Respectă `prefers-reduced-motion`
 * prin regula globală din `globals.css` (transform→none).
 *
 * Două mișcări: slide SUS la deschidere (prima impresie contează), slide JOS la
 * închidere. Demontarea vine abia după ce slide-ul de jos s-a terminat — de aia
 * `visible` e o stare internă, urmărită după `open`, iar `onClose` (care
 * demontează la părinte) se apelează cu o întârziere egală cu tranziția.
 */
function MapSheet({
  open,
  onClose,
  zone,
  children,
}: {
  open: boolean;
  onClose: () => void;
  zone: MapZone;
  children: ReactNode;
}) {
  // La mount randăm cu `translate-y-full` (jos), apoi un cadru mai târziu
  // urcăm — ca slide-ul de intrare să aibă o valoare de la care să pornească.
  // Fără citirea asta de layout, React pune direct clasa finală și nicio
  // mișcare nu se vede (aceeași capcană ca zoom-ul din hero).
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);
  // `visible` e derivat din `open` (+ intrarea la mount), nu ținut în efect:
  // la închidere `open` trece fals și slide-ul jos pornește imediat, fără
  // efect sincron care să declanșeze randări în cascadă.
  const visible = entered && open;

  const active = zone.items.filter((p) => !isSold(p)).length;
  const sold = zone.items.filter(isSold).length;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col justify-end md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`Proprietăți în ${zone.name}`}
    >
      {/* Backdrop: întunecă harta, închide la atingere. Când sheet-ul e în
          curs de închidere, nu mai interceptează atingerile (altfel ar bloca
          harta de dedesubt cât durează slide-ul jos). */}
      <button
        type="button"
        aria-label="Închide"
        onClick={onClose}
        tabIndex={visible ? 0 : -1}
        className={`absolute inset-0 bg-void/70 transition-opacity duration-300 ${
          visible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Sheet-ul. Lungimea capped la 80% din ecran; restul se derulează în el. */}
      <div
        className={`bg-void-soft border-void-line relative max-h-[80dvh] overflow-hidden rounded-t-2xl border-t transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Mânerul de sus: singurul reper vizual că sheet-ul se poate trage.
            E doar vizual (nu implementăm drag); închiderea se face prin
            buton, backdrop sau Escape. */}
        <div className="flex justify-center pt-3">
          <span className="bg-paper/25 h-1 w-10 rounded-full" />
        </div>

        <div className="flex items-baseline justify-between gap-4 px-5 pt-3">
          <div>
            <p className="eyebrow text-paper/50">{zone.name}</p>
            <p className="text-paper/45 nums mt-1 text-xs">
              {active > 0 && `${active} ${active === 1 ? "activă" : "active"}`}
              {active > 0 && sold > 0 && " · "}
              {sold > 0 && `${sold} ${sold === 1 ? "vândută" : "vândute"}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-paper/60 hover:text-paper shrink-0 cursor-pointer text-xs transition-colors duration-300"
          >
            Închide
          </button>
        </div>

        <div className="max-h-[60dvh] overflow-y-auto px-5 pb-8 pt-3">{children}</div>
      </div>
    </div>
  );
}

/**
 * Un rând de proprietate în lista de la click pe o zonă.
 *
 * E scos ca bucată partajată: randează la fel în panoul de lângă hartă (desktop)
 * și în bottom sheet-ul de pe telefon. Singura diferență între active și
 * vândute e eticheta: cele active arată prețul, cele vândute arată statusul ca
 * badge — cerut de Vlad, ca „să se observe care sunt vândute", nu doar text
 * mic gri sub titlu, de neosebit de un preț.
 */
function ZonePropertyItem({ property }: { property: Property }) {
  const sold = isSold(property);
  return (
    <li>
      <Link
        href={`/proprietati/${property.slug}`}
        className="border-void-line group block border-b py-4"
      >
        <p className="font-display group-hover:text-bronze-soft text-xl leading-tight transition-colors duration-300">
          {property.title}
        </p>
        {sold ? (
          <div className="mt-1.5 flex items-center gap-2.5">
            {/* Badge, nu text gri: o proprietate vândută trebuie să se vadă
                că e vândută, nu să semene cu un preț. Ton așezat, fără roșu. */}
            <span className="border-paper/25 text-paper/60 inline-flex items-center border px-2 py-0.5 text-[0.6875rem] tracking-[0.08em] uppercase">
              {statusLabel[property.status]}
            </span>
            <span className="text-paper/45 nums text-sm">{property.specs.surface} mp</span>
          </div>
        ) : (
          <p className="text-paper/45 nums mt-1 text-sm">
            {property.status === "rezervat" ? `${statusLabel.rezervat} · ` : ""}
            {priceLabel(property)} · {property.specs.surface} mp
          </p>
        )}
      </Link>
    </li>
  );
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
  /**
   * Zona aleasă cu click, în modul editorial. Nu se pierde la `pointerleave`,
   * și ăsta e tot rostul ei.
   *
   * Înainte, `selected` era chiar `hovered`: alegeai o zonă cu mouse-ul, în
   * panou apăreau proprietățile ei, iar ca să dai click pe vreuna trebuia să
   * ieși cu mouse-ul de pe hartă — adică exact gestul care ștergea selecția.
   * Lista dispărea sub cursor și nu se putea ajunge niciodată la ea. La fel și
   * în lista „Toate zonele”: treceai cu mouse-ul peste un rând, panoul se
   * schimba în lista de proprietăți, deci lista de zone de sub cursor se
   * evapora.
   */
  const [picked, setPicked] = useState<string | null>(null);

  /**
   * Pe telefon, lista proprietăților din zona aleasă vine într-un bottom sheet
   * care urcă din jos, nu în panoul de lângă hartă — acela cade sub hartă pe un
   * ecran îngust, deci după click trebuie scroll ca să-l vezi, și nici nu e
   * evident că a apărut. Vlad: „trebuie scroll în jos ca să le vezi".
   *
   * Detectat la montare, ca în `HorizontalShowcase`: server-ul randează mereu
   * varianta de desktop (panou în grid), iar clientul schimbă pe sheet doar pe
   * ecran îngust. Așa nu există nepotrivire la hidratare și panoul rămâne dacă
   * JS nu pornește.
   */
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /** Sheet-ul e deschis pe telefon doar cât e o zonă aleasă. */
  const [sheetOpen, setSheetOpen] = useState(false);

  /**
   * Închide sheet-ul în două timpi: întâi `sheetOpen=false` (pornește slide-ul
   * jos — `MapSheet` randează `translate-y-full` când `open` e fals), apoi după
   * cât durează tranziția resetăm `picked`, ceea ce demontează sheet-ul. Altfel
   * demontarea ar tăia animația la jumătate, iar backdrop-ul ar rămâne (
   * `opacity-0`, dar `pointer-events` pe el) blocând harta de dedesubt.
   */
  const closeSheet = () => {
    setSheetOpen(false);
    window.setTimeout(() => setPicked(null), 500);
  };

  // Scroll-lock pe body cât timp sheet-ul e deschis, plus Escape ca să-l închizi
  // — aceleași reguli ca la lightbox-ul din `Gallery`. Doar pe mobil, fiindcă
  // doar acolo există sheet.
  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSheet();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [sheetOpen]);

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
   * Zona aleasă. Vine din bara de filtre în modul filtru, din click în modul
   * editorial. În niciunul nu depinde de unde stă mouse-ul.
   */
  const selected = isFilter ? (value && value !== "toate" ? value : null) : picked;
  /** Zona din panou. Se mișcă doar la click. */
  const selectedZone = zones.find((zone) => zone.name === selected);
  /**
   * Eticheta de pe hartă. Asta da, urmărește cursorul — dar e doar un nume
   * lipit lângă un punct, nu conținut cu linkuri în el, deci n-are cum să-ți
   * fugă de sub deget.
   */
  const shown = zones.find((zone) => zone.name === (hovered ?? selected));
  const missing = properties.length - zones.reduce((n, zone) => n + zone.items.length, 0);
  const inIlfov = zones.filter((zone) => zone.ilfov).length;

  /** Click pe un punct sau pe un rând din listă. A doua oară pe același: înapoi. */
  const pick = (name: string) => {
    if (isFilter) onChange?.(selected === name ? "toate" : name);
    else if (!isMobile) {
      // Desktop: panoul din grid. Comută `picked`.
      setPicked((current) => (current === name ? null : name));
    } else {
      // Telefon: prima oară pe o zonă deschide sheet-ul; a doua oară pe
      // aceeași îl închide (nu-l redeschide gol).
      if (selected === name) closeSheet();
      else {
        setPicked(name);
        setSheetOpen(true);
      }
    }
  };

  /** Ieșirea din zona aleasă. */
  const clear = () => {
    if (isFilter) onChange?.("toate");
    else {
      setPicked(null);
      setSheetOpen(false);
    }
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
            // Tailwind v4 pune `cursor: default` pe butoane. Pe niște cerculețe
            // care nu seamănă cu un buton, asta înseamnă că nimic nu spune că
            // se poate da click — și chiar asta a fost reclamația.
            className="absolute grid cursor-pointer place-items-center"
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

  /* ---------- Lista proprietăților dintr-o zonă (partajată) ----------
     Aceeași listă în două locuri: panoul de lângă hartă (desktop) și bottom
     sheet-ul (telefon). Activele primele, vândutele la final cu etichetă. */
  const renderZoneItems = (zone: MapZone) => {
    const active = zone.items.filter((p) => !isSold(p));
    const sold = zone.items.filter(isSold);
    const mixed = active.length > 0 && sold.length > 0;
    return (
      <ul className="border-void-line border-t">
        {active.map((property) => (
          <ZonePropertyItem key={property.slug} property={property} />
        ))}
        {mixed && (
          <li className="text-paper/35 mt-2 mb-1 px-0.5 text-[0.6875rem] tracking-[0.08em] uppercase">
            Vândute anterior
          </li>
        )}
        {sold.map((property) => (
          <ZonePropertyItem key={property.slug} property={property} />
        ))}
      </ul>
    );
  };

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
            {/* Pe telefon, harta e singură (panoul e ascuns, vine în sheet).
                Fără un hint, nu e evident că atingerea unei buline face ceva.
                Doar mobil; pe desktop panoul din dreapta își spune singur rostul. */}
            <p className="text-paper/45 mt-5 text-sm md:hidden">
              Atinge o zonă, ca să vezi ce am acolo.
            </p>
          </div>

          {/* ---------- Panoul (desktop) ----------
             Pe telefon, panoul ăsta e ascuns — lista vine în bottom sheet-ul de
             la sfârșit (vezi `isMobile` mai sus), ca să nu cadă sub hartă și să
             ceară scroll ca s-o vezi. Pe desktop rămâne aici, în grid lângă
             hartă, neschimbat. */}
          <div className="hidden md:col-span-4 md:col-start-9 md:block">
            <div className="flex items-baseline justify-between gap-4">
              <p className="eyebrow text-paper/50">
                {selectedZone ? selectedZone.name : "Alege o zonă"}
              </p>

              {/* Singura ieșire din zona aleasă, de când selecția nu mai moare
                  la `pointerleave`. Înainte era doar o plasă pentru atingere;
                  acum e drumul înapoi și pe mouse. */}
              {selectedZone && (
                <button
                  type="button"
                  onClick={clear}
                  className="text-paper/40 hover:text-paper shrink-0 cursor-pointer text-xs transition-colors duration-300"
                >
                  Toate zonele
                </button>
              )}
            </div>

            {selectedZone ? (
              <div className="mt-5">{renderZoneItems(selectedZone)}</div>
            ) : (
              <>
                {/* „sau din listă” nu e o formulă de politețe: pe telefon,
                    harta intră în ~335px, iar Cișmigiu și Grădina Icoanei sunt
                    la 1,4 km unul de altul — adică vreo 17 pixeli. Punctele nu
                    se pot nimeri cu degetul la scara aia, deci lista de mai jos
                    e calea adevărată acolo, nu o variantă de rezervă. */}
                <p className="text-paper/55 mt-5 text-sm">
                  Dă click pe o zonă, de pe hartă sau din listă, și îți arăt ce am acolo.
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

                  {/* Trecerea cu mouse-ul peste un rând aprinde punctul lui pe
                      hartă și atât. Panoul nu se schimbă — dacă s-ar schimba,
                      lista asta ar dispărea de sub cursorul care o parcurge. */}
                  <ul
                    className="max-h-[19rem] overflow-y-auto"
                    onPointerLeave={() => setHovered(null)}
                  >
                    {zones.map((zone) => (
                      <li key={zone.name}>
                        <button
                          type="button"
                          onPointerEnter={() => setHovered(zone.name)}
                          onFocus={() => setHovered(zone.name)}
                          onClick={() => pick(zone.name)}
                          className="border-void-line hover:text-bronze-soft flex w-full cursor-pointer items-baseline justify-between border-b py-2.5 text-left text-sm transition-colors duration-300"
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

      {/* ---------- Bottom sheet (telefon) ----------
         Pe telefon, la click pe o zonă, lista proprietăților urcă din josul
         ecranului — ca Google Maps sau Apple Maps. Nu trebuie scroll să ajungi
         la ea (căci nu e sub hartă), și e evident că a apărut. Backdrop-ul
         întunecă harta și închide la atingere; mânerul de sus și butonul
         „Închide" sunt celelalte două ieșiri.

         `mounted` ne asigură că slide-ul animat pornește după ce React a pus
         sheet-ul în DOM; altfel ar apărea direct în poziția finală, fără
         mișcare — aceeași capcană ca zoom-ul din hero (animație vs. tranziție). */}
      {isMobile && selectedZone && (
        <MapSheet open={sheetOpen} onClose={closeSheet} zone={selectedZone}>
          {renderZoneItems(selectedZone)}
        </MapSheet>
      )}
    </section>
  );
}
