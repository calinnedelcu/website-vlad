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
import { resolveZone } from "./geo";
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
  | "hala";

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
      o?.neighborhood ?? (g.zone ? resolveZone(g.zone.slug) : null) ?? g.sourceLocality ?? "";
    const surface = g.specs.surface;

    return [
      {
        slug: o?.slug ?? fallbackSlug(g.sourceUrl, g.id),
        title: o?.title ?? g.sourceTitle,
        // Fără tagline scris de mână, compunem unul din fapte — zonă și
        // suprafață. Scurt, adevărat, și nu inventează nimic.
        tagline:
          o?.tagline ??
          [neighborhood, surface ? `${surface} mp` : null].filter(Boolean).join(" — "),
        kind: (o?.kind ?? g.kind) as PropertyKind,
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

        specs: {
          surface: surface ?? 0,
          ...(g.specs.rooms ? { rooms: g.specs.rooms } : {}),
          ...(g.specs.baths ? { baths: g.specs.baths } : {}),
          ...(g.specs.year ? { year: g.specs.year } : {}),
          ...(o?.specs ?? {}),
        },

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
  [...new Set(availableProperties().map((p) => p.neighborhood))].sort((a, b) =>
    a.localeCompare(b, "ro"),
  );

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
