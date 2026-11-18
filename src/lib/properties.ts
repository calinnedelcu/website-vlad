/**
 * Modelul de proprietate + portofoliul.
 *
 * DE UNDE VIN DATELE — se citesc din două locuri, care nu se calcă niciodată:
 *
 * 1. `properties.generated.json` — scris de `npm run sync`, din datele
 *    structurate publicate de site-ul agenției. Preț, suprafață, camere, an,
 *    fotografii, descriere, vânzare-vs-închiriere. Se rescrie singur zilnic;
 *    NU-L EDITA DE MÂNĂ, se pierde la următoarea sincronizare.
 * 2. `property-overrides.ts` — scris de noi. Titlul omenesc, tagline-ul, zona
 *    corectată, reperele din jur, ce e „featured”. Sincronizarea nu-l atinge.
 *    Ăsta e fișierul pe care îl editezi.
 *
 * Cheia comună e id-ul din CRM, cel din coada adresei anunțului (`...cp3237398/`).
 *
 * DE CE DOUĂ FIȘIERE. Vlad schimbă prețul în CRM și se schimbă și pe site, fără
 * ca cineva să atingă codul — asta a cerut. Dar titlurile din CRM sunt scrise
 * pentru portaluri („CISMIGIU - Cobalcescu 4 Camere 85 mp Renovat 1/3”), iar
 * zona e „Bucuresti” la zece din douăsprezece anunțuri. Dacă am lua tot din
 * flux, site-ul ar arăta ca un portal. Dacă am scrie tot de mână, am ajunge
 * iar să actualizăm prețuri cu mâna. Deci: cifrele automat, cuvintele de la noi.
 *
 * CE SE ÎNTÂMPLĂ CU O PROPRIETATE DISPĂRUTĂ DIN LISTARE — automat, fără om.
 * Sincronizarea citește de pe pagina anunțului ce s-a întâmplat (`outcome`, vezi
 * `scripts/sync-properties.mjs`), iar aici se aplică regula, pe PROPRIETATEA
 * FIZICĂ (folderul de fotografii + vânzare/închiriere), nu pe id-ul anunțului —
 * CRM-ul dă id nou la fiecare re-listare, deci una singură poate avea șase:
 *
 *   1. Dacă oricare dintre ele e în listare → proprietatea e DISPONIBILĂ, iar
 *      versiunile vechi dispar (altfel ar apărea de două ori).
 *   2. Altfel, dacă oricare are `outcome: sold` → tranzacție încheiată:
 *      VÂNDUT (vânzare) sau ÎNCHIRIAT (închiriere).
 *   3. Altfel (retras, șters, sau nu știm) → nu apare deloc. „Nu știm” nu devine
 *      niciodată „vândut”.
 *
 * `status` din `property-overrides.ts` rămâne portiță: bate regula, pentru cazul
 * în care agenția greșește. De obicei stă gol.
 */

import { asset } from "./asset";
import { resolveZone, zoneCoords } from "./geo";
import generated from "./properties.generated.json";
import { order, overrides } from "./property-overrides";


export type Deal = "vanzare" | "inchiriere";
export type Segment = "rezidential" | "comercial";
export type Status = "disponibil" | "rezervat" | "vandut" | "inchiriat";

export type PropertyKind =
  | "apartament"
  | "penthouse"
  | "casa"
  | "vila"
  | "birouri"
  | "spatiu comercial"
  | "hala"
  | "teren";

export interface Property {
  slug: string;
  title: string;
  /** Linia editorială de sub titlu — nu specificații, ci caracter. */
  tagline: string;
  kind: PropertyKind;
  deal: Deal;
  segment: Segment;
  status: Status;

  neighborhood: string;
  /** Reper aproximativ. Adresa exactă nu se publică niciodată. */
  area: string;

  price: {
    amount: number;
    currency: "EUR";
    /** Doar la închirieri. */
    period?: "luna";
    /** Ascunde prețul și cere contact — pentru proprietăți discrete. */
    onRequest?: boolean;
  };

  specs: {
    surface: number;
    land?: number;
    rooms?: number;
    baths?: number;
    floor?: string;
    year?: number;
    parking?: number;
  };

  /** Descrierea reală, ruptă în paragrafe. */
  story: string[];
  highlights: string[];
  /** Ce e aproape — doar ce scrie efectiv în anunț, nimic inventat. */
  nearby: { label: string; detail: string }[];

  media: {
    cover: string;
    gallery: string[];
    /** Slot pentru Mux / video walkthrough. */
    video?: string;
    /** Slot pentru embed Matterport / Kuula. */
    tour3d?: string;
  };

  featured?: boolean;
  /** Doar la cele vândute — devine dovada de track record. */
  soldNote?: string;
  /** Anunțul de pe site-ul agenției, pentru verificare. */
  sourceUrl?: string;
  /** Exclusivitate — argument real, folosit de agenție pe fiecare anunț. */
  exclusive?: boolean;
}

/**
 * Fotografiile stau local, în `public/media/`, aduse și redimensionate de
 * `scripts/fetch-media.mjs` (`npm run media`). Căile din fișierul generat sunt
 * cele originale de pe CDN-ul agenției — scriptul le citește de acolo, așa că
 * nu există o a doua listă de întreținut. Extensia se schimbă în `.webp`.
 */
const m = (path: string) =>
  asset(`/media/property_images/${path.replace(/\.(jpe?g|png)$/i, ".webp")}`);

/** Forma unei înregistrări din fișierul generat. */
interface Generated {
  id: string;
  listed: boolean;
  /**
   * Doar la cele dispărute din listare, citit de pe pagina anunțului:
   * `sold` (SoldOut) | `withdrawn` (Discontinued) | `removed` (șters din CRM).
   * Lipsește când n-am putut citi — și atunci proprietatea nu se arată.
   */
  outcome?: "sold" | "withdrawn" | "removed";
  sourceUrl: string;
  sourceTitle: string;
  kind: string;
  segment: string;
  deal: string;
  price: { amount: number; currency: string; period?: string };
  specs: { surface?: number; rooms?: number; baths?: number; year?: number };
  sourceLocality: string;
  zone?: { slug: string; county: "bucuresti" | "ilfov" } | null;
  story: string[];
  media: { cover: string; gallery: string[] };
}

/**
 * Adresa de pe site-ul nostru, pentru un anunț care n-are încă un rând scris de
 * mână. A lor arată așa:
 *   apartament-2-camere-de-inchiriat-central-voluntari-cp3283496
 * Tăiem coada cu id-ul și rămâne ceva citibil. E o plasă, nu o soluție: pentru
 * proprietățile care contează se scrie un `slug` scurt în overrides.
 */
function fallbackSlug(sourceUrl: string, id: string): string {
  const last = sourceUrl.replace(/\/+$/, "").split("/").pop() ?? id;
  return last.replace(/-cp\d+$/, "") || id;
}

/**
 * Împerecherea celor două straturi.
 *
 * Regula, peste tot: ce e scris de mână bate ce vine din flux. Pentru câmpurile
 * pe care fluxul nu le are deloc — reperele din jur, etajul — nu inventăm o
 * valoare; rămân goale și paginile știu să nu le afișeze.
 */
/**
 * Folderul în care stau fotografiile, din prima cale de imagine: `3246242/x.jpg`.
 *
 * E identitatea durabilă a unei proprietăți, mai durabilă decât id-ul
 * anunțului. CRM-ul agenției dă un id NOU la fiecare re-listare, dar
 * fotografiile rămân în folderul de la prima încărcare — verificat: anunțul
 * `3374021` are pozele în `3131961`, id pe care îl avea acum două luni.
 */
const photoFolder = (g: Generated) => (g.media.cover || "").split("/")[0];

/**
 * Textul scris de mână pentru o proprietate.
 *
 * Se caută întâi pe id-ul anunțului, apoi pe folderul de fotografii. A doua
 * cale nu e un moft: în șase săptămâni, CRM-ul a re-listat tot portofoliul cu
 * id-uri noi, iar toate cele douăzeci de fișe scrise de noi au rămas legate de
 * id-uri moarte. Site-ul a afișat brusc titluri de portal — „3 Camere Asmitha
 * Gardens 100 mp Metrou 7 m PET FRIENDLY”. Legat de folder, textul supraviețuiește
 * re-listării, fără ca cineva să bage de seamă că s-a întâmplat ceva.
 */
const overrideFor = (g: Generated) => overrides[g.id] ?? overrides[photoFolder(g)];

/** „Bucuresti” din flux, cu diacritice — ultima plasă când zona nu se găsește. */
const prettyLocality = (s: string | undefined) => (/^bucuresti$/i.test(s ?? "") ? "București" : (s ?? ""));

const ROOM_WORDS: Record<number, string> = { 2: "Două camere", 3: "Trei camere", 4: "Patru camere", 5: "Cinci camere" };
const KIND_TITLES: Partial<Record<PropertyKind, string>> = {
  casa: "Casă",
  vila: "Vilă",
  penthouse: "Penthouse",
  birouri: "Birouri",
  "spatiu comercial": "Spațiu comercial",
  hala: "Hală",
  teren: "Teren",
};

/**
 * Titlu pentru un anunț care n-are încă unul scris de mână. Cele din CRM sunt
 * scrise pentru portaluri („Apartment 2 Camere Voluntari Lux 1/1 36 mp Bloc 2025
 * Prima Inchiriere”) și pe site arătau ca atare. Din fapte iese ceva citibil și
 * adevărat: „Două camere în Voluntari”. Nu inventează nimic — doar tipul,
 * numărul de camere și zona, toate din flux.
 */
function autoTitle(kind: PropertyKind, rooms: number | undefined, zone: string): string {
  const what =
    kind === "apartament"
      ? rooms === 1
        ? "Garsonieră"
        : rooms
          ? (ROOM_WORDS[rooms] ?? `${rooms} camere`)
          : "Apartament"
      : (KIND_TITLES[kind] ?? "Proprietate");
  return zone ? `${what} în ${zone}` : what;
}

/**
 * Ce spune titlul din CRM în afară de tip, camere și zonă — „Lux”, „Bloc 2025”,
 * „Parcare”, „Finisaje Premium”, „Metrou 6 min”, „5/8”. La multe anunțuri
 * descrierea e doar „Comision 0%”, deci titlul e SINGURUL loc unde stau aceste
 * detalii; dacă nu le luăm de acolo, titlul compus de mai sus le pierde.
 *
 * Nu se copiază textul lor — e scris pentru portaluri, fără diacritice și cu
 * prescurtări. Se recunosc doar formulele de mai jos, fiecare tradusă într-o
 * expresie curată, iar ce nu se recunoaște se ignoră: mai bine un detaliu lipsă
 * decât unul înțeles greșit. Nimic nu se adaugă din ce nu scrie în titlu.
 */
function titleFacts(sourceTitle: string): { features: string[]; floor?: string } {
  const t = sourceTitle
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const has = (re: RegExp) => re.test(t);
  const features: string[] = [];
  const add = (cond: boolean, text: string) => cond && features.push(text);

  add(has(/\blux\b/), "lux");
  add(has(/\bfinisaje premium\b/), "finisaje premium");
  add(has(/\brenovat/), "renovat");
  if (has(/\bmobilat\b/) && has(/\butilat\b/)) features.push("mobilat și utilat");
  else add(has(/\bmobilat\b/), "mobilat");
  add(has(/\bduplex\b/), "duplex");
  add(has(/\bpet friendly\b/), "pet friendly");
  add(has(/\bprima inchiriere\b/), "prima închiriere");
  add(has(/\bview panoramic\b/), "vedere panoramică");
  add(has(/\bparter inalt\b/), "parter înalt");

  const bloc = t.match(/\bbloc (\d{4})\b/);
  if (bloc) features.push(`bloc din ${bloc[1]}`);
  const niveluri = t.match(/\bd\+p\+(\d)e\b/);
  if (niveluri) features.push(`demisol, parter și ${niveluri[1]} etaje`);
  add(has(/\bp\+1\+m\b/), "parter, etaj și mansardă");

  if (has(/\bcentrala proprie\b/)) features.push("centrală proprie");
  else add(has(/\bcentrala\b/), "centrală");
  add(has(/\bac\b/), "aer condiționat");
  if (has(/\bparcare inclusa\b/)) features.push("parcare inclusă");
  else add(has(/\bparcare\b/), "parcare");
  const metrou = t.match(/(?:(\d+)\s*min\w*\s*metrou|metrou\s*(\d+)\s*min)/);
  if (metrou) features.push(`metrou la ${metrou[1] ?? metrou[2]} minute`);

  const parter = t.match(/\bparter\/(\d{1,2})\b/);
  const etaj = t.match(/\b(\d{1,2})\/(\d{1,2})\b/);
  const floor = parter ? `parter / ${parter[1]}` : etaj ? `${etaj[1]} / ${etaj[2]}` : undefined;

  return { features: features.slice(0, 4), floor };
}

/** Proprietatea fizică: aceleași poze, aceeași tranzacție. Vezi antetul fișierului. */
const physicalKey = (g: Generated) => `${photoFolder(g)}|${g.deal}`;

/**
 * Pentru fiecare proprietate fizică: e listată acum sub vreun id, și care id
 * poartă tranzacția încheiată (cel mai nou, dacă sunt mai multe).
 */
function groupState(records: Generated[]) {
  const state = new Map<string, { listed: boolean; soldId: string | null; newestId: string }>();
  for (const g of records) {
    const key = physicalKey(g);
    const cur = state.get(key) ?? { listed: false, soldId: null, newestId: g.id };
    if (g.listed) cur.listed = true;
    if (g.outcome === "sold" && (!cur.soldId || Number(g.id) > Number(cur.soldId))) cur.soldId = g.id;
    if (Number(g.id) > Number(cur.newestId)) cur.newestId = g.id;
    state.set(key, cur);
  }
  return state;
}

function build(): Property[] {
  const records = Object.values(generated.properties as Record<string, Generated>);
  const groups = groupState(records);

  const merged = records.flatMap((g): Property[] => {
    const o = overrideFor(g);
    const group = groups.get(physicalKey(g))!;

    // Ce arătăm din fiecare proprietate fizică — vezi regula din antet.
    //  - Dacă e listată sub un id, doar anunțul listat; vechile versiuni ies.
    //  - Altfel, doar anunțul cu tranzacția încheiată (`outcome: sold`).
    //  - Altfel nimic: retras, șters sau neclar. Dacă Vlad vrea totuși una
    //    arătată, `status` în overrides o aduce (atunci cea mai nouă versiune).
    if (g.listed) {
      // listat → rămâne
    } else if (group.listed) {
      return [];
    } else if (group.soldId) {
      if (g.id !== group.soldId) return [];
    } else if (!(o?.status && g.id === group.newestId)) {
      return [];
    }

    // Ascuns cu mâna. Agenția își listează uneori aceeași proprietate de două
    // ori — o dată ca spațiu comercial, o dată ca locuință — iar pe site ar
    // apărea de două ori. Vezi `hidden` în property-overrides.ts.
    if (o?.hidden) return [];

    /**
     * Zona. Trei surse, în ordinea încrederii:
     *
     * 1. Ce am scris noi de mână — bate tot.
     * 2. Zona din adresa anunțului, potrivită cu un reper de pe hartă. De aici
     *    ies diacriticele corecte („grozavesti” → „Grozăvești”) și tot de aici
     *    apar bulele noi pe hartă.
     * 3. Localitatea din flux, ca ultimă plasă. E „Bucuresti” la aproape tot,
     *    deci nu desenează nimic — dar e mai bine decât un câmp gol sub titlu.
     */
    const neighborhood =
      o?.neighborhood ??
      (g.zone ? resolveZone(g.zone.slug) : null) ??
      prettyLocality(g.sourceLocality);
    const kind = (o?.kind ?? g.kind) as PropertyKind;
    const surface = g.specs.surface;

    const facts = titleFacts(g.sourceTitle);
    const specs: Property["specs"] = {
      surface: surface ?? 0,
      ...(facts.floor ? { floor: facts.floor } : {}),
      ...(g.specs.rooms ? { rooms: g.specs.rooms } : {}),
      ...(g.specs.baths ? { baths: g.specs.baths } : {}),
      ...(g.specs.year ? { year: g.specs.year } : {}),
      ...(o?.specs ?? {}),
    };
    // La teren, suprafața din CRM nu e a terenului (la cel din Adunații-Copăceni
    // zicea 766 mp, iar terenul are 26.620). Suprafața lui e terenul: o singură
    // cifră, cea scrisă de noi, în loc de două care se bat cap în cap.
    if (kind === "teren") {
      specs.surface = specs.land ?? 0;
      delete specs.land;
    }

    return [
      {
        slug: o?.slug ?? fallbackSlug(g.sourceUrl, g.id),
        title: o?.title ?? autoTitle(kind, g.specs.rooms, neighborhood),
        // Fără tagline scris de mână, compunem unul din fapte — zonă și
        // suprafață. Scurt, adevărat, și nu inventează nimic.
        tagline:
          o?.tagline ??
          [
            [neighborhood, surface ? `${surface} mp` : null].filter(Boolean).join(" — "),
            ...facts.features,
          ]
            .filter(Boolean)
            .join(", "),
        kind,
        deal: (o?.deal ?? g.deal) as Deal,
        segment: (o?.segment ?? g.segment) as Segment,
        status:
          o?.status ??
          (g.listed ? "disponibil" : g.deal === "vanzare" ? "vandut" : "inchiriat"),

        neighborhood,
        area: o?.area ?? neighborhood,

        price: {
          amount: g.price.amount,
          currency: "EUR",
          ...(g.price.period === "luna" ? { period: "luna" as const } : {}),
        },

        specs,

        story: g.story,
        highlights: o?.highlights ?? [],
        nearby: o?.nearby ?? [],

        media: {
          cover: m(g.media.cover),
          gallery: g.media.gallery.map(m),
        },

        ...(o?.featured ? { featured: true } : {}),
        ...(o?.exclusive ? { exclusive: true } : {}),
        ...(o?.soldNote ? { soldNote: o.soldNote } : {}),
        sourceUrl: g.sourceUrl,
      },
    ];
  });

  // Ordinea de afișare e cea din `order`, în overrides — curatorială, aleasă de
  // om. Ce nu e trecut acolo (adică anunțurile noi, încă nefinisate) vine după,
  // cel mai nou întâi, ca să nu aștepte o decizie ca să apară pe site.
  const rank = new Map(order.map((id, i) => [id, i]));
  const idOf = (p: Property) => p.sourceUrl?.match(/cp(\d+)/)?.[1] ?? "";
  // Locul se caută și după folderul de poze: o proprietate re-listată are alt id
  // decât cel trecut în `order`, dar același folder (ca la `overrideFor`).
  const folderOf = (p: Property) => p.media.cover.match(/property_images\/(\d+)\//)?.[1] ?? "";
  const rankOf = (p: Property) => rank.get(idOf(p)) ?? rank.get(folderOf(p));
  merged.sort((a, b) => {
    const ra = rankOf(a);
    const rb = rankOf(b);
    if (ra !== undefined && rb !== undefined) return ra - rb;
    if (ra !== undefined) return -1;
    if (rb !== undefined) return 1;
    return Number(idOf(b)) - Number(idOf(a));
  });

  // Adrese care nu se ciocnesc. Slug-ul de rezervă taie id-ul din adresa lor, deci
  // două apartamente din aceeași stradă și cu același număr de camere — Voluntari,
  // Metalurgiei — ies cu ACELAȘI slug: o singură pagină, iar cealaltă proprietate
  // trimite la poze și preț străine. Se vedea rar cât erau puține anunțuri; odată
  // cu închirierile încheiate, apare. Cele care se ciocnesc primesc id-ul înapoi;
  // cele cu slug scris de mână nu se ating.
  const uses = new Map<string, number>();
  for (const p of merged) uses.set(p.slug, (uses.get(p.slug) ?? 0) + 1);
  return merged.map((p) =>
    (uses.get(p.slug) ?? 0) > 1 && p.sourceUrl && p.slug === fallbackSlug(p.sourceUrl, idOf(p))
      ? { ...p, slug: `${p.slug}-${idOf(p)}` }
      : p,
  );
}

export const properties: Property[] = build();

/**
 * Când s-au schimbat ultima dată chiar datele — nu când a rulat ultima
 * sincronizare. Rulările care nu găsesc nimic nou nu ating fișierul, tocmai ca
 * să nu producă un commit și un deploy pe zi degeaba.
 */
export const updatedAt: string = generated.updatedAt;

export const getProperty = (slug: string) => properties.find((p) => p.slug === slug);

export const featuredProperties = () => properties.filter((p) => p.featured);

export const availableProperties = () =>
  properties.filter((p) => p.status === "disponibil" || p.status === "rezervat");

/**
 * Tranzacțiile încheiate: întâi vânzările — sunt dovada de track record și ele
 * deschid pagina și selecția de pe prima pagină — apoi închirierile. În fiecare
 * grup rămâne ordinea curatorială din `order`.
 */
export const soldProperties = () => [
  ...properties.filter((p) => p.status === "vandut"),
  ...properties.filter((p) => p.status === "inchiriat"),
];

/**
 * Zonele unde chiar are ceva acum.
 *
 * ASTA se afișează public, nu `neighborhoods()`. Când au intrat tranzacțiile
 * încheiate, banda de pe home a început să promită 17 zone deși stocul acoperea
 * 11 — cinci dintre ele erau zone unde vânduse tot. O zonă anunțată fără nimic
 * în ea e o promisiune pe care n-o poți ține la telefon.
 */
export const availableNeighborhoods = () =>
  [
    ...new Set(
      availableProperties()
        .map((p) => p.neighborhood)
        // Doar zonele de pe hartă: filtrul de zonă merge cu harta de deasupra lui.
        // Un teren din alt județ rămâne în listă, dar nu are zonă de filtrat.
        .filter((n) => n in zoneCoords),
    ),
  ].sort((a, b) => a.localeCompare(b, "ro"));

/* Aici erau `neighborhoods()` (toate zonele atinse vreodată) și
   `portfolioStats()` (patru cifre pentru un bloc de statistici). Amândouă
   serveau doar pagina /despre, ștearsă la cererea lui Calin. Cifrele de pe
   site se calculează în continuare din date, nu se scriu de mână — vezi
   `availableProperties()` și `availableNeighborhoods()`, care au rămas. */

const eur = new Intl.NumberFormat("ro-RO", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/** Suprafețe cu separator de mii: „26.620 mp”, nu „26620 mp”. */
export const formatArea = (n: number) => new Intl.NumberFormat("ro-RO").format(n);

/** „1 cameră”, nu „1 camere”. */
export const roomsLabel = (n: number) => (n === 1 ? "1 cameră" : `${n} camere`);

export function formatPrice(price: Property["price"]): string {
  if (price.onRequest) return "Preț la cerere";
  const value = eur.format(price.amount);
  return price.period === "luna" ? `${value} / lună` : value;
}

/** Închirierile comerciale se cotează pe tot spațiul, nu pe mp — ca în anunțuri. */
export function priceLabel(property: Property): string {
  return formatPrice(property.price);
}

export const statusLabel: Record<Status, string> = {
  disponibil: "Disponibil",
  rezervat: "Rezervat",
  vandut: "Vândut",
  inchiriat: "Închiriat",
};

export const dealLabel: Record<Deal, string> = {
  vanzare: "De vânzare",
  inchiriere: "De închiriat",
};

export const segmentLabel: Record<Segment, string> = {
  rezidential: "Rezidențial",
  comercial: "Comercial",
};
