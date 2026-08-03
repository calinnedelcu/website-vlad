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
 * O PROPRIETATE DISPĂRUTĂ DIN LISTARE nu devine automat „vândută”. Fluxul spune
 * mereu `InStock`; când se vinde, anunțul pur și simplu dispare — la fel ca
 * atunci când e retras de pe piață. Deci: dispare de pe site, dar nu scrie
 * nicăieri „vândut” până nu confirmă Vlad și nu se trece `status` în
 * `property-overrides.ts`. Vezi README, regula despre cifre inventate.
 */

import { asset } from "./asset";
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
  sourceUrl: string;
  sourceTitle: string;
  kind: string;
  segment: string;
  deal: string;
  price: { amount: number; currency: string; period?: string };
  specs: { surface?: number; rooms?: number; baths?: number; year?: number };
  sourceLocality: string;
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
function build(): Property[] {
  const records = Object.values(generated.properties as Record<string, Generated>);

  const merged = records.flatMap((g): Property[] => {
    const o = overrides[g.id];

    // Dispărut din listare și neconfirmat de nimeni: nu-l arătăm deloc. Nu e
    // nici disponibil (nu mai e pe piață), nici vândut (nu știm asta). Iese
    // din site și apare în raportul sincronizării, ca să întrebi.
    if (!g.listed && !o?.status) return [];

    const neighborhood = o?.neighborhood ?? g.sourceLocality ?? "";
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
        status: o?.status ?? "disponibil",

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
  return merged.sort((a, b) => {
    const ra = rank.get(idOf(a));
    const rb = rank.get(idOf(b));
    if (ra !== undefined && rb !== undefined) return ra - rb;
    if (ra !== undefined) return -1;
    if (rb !== undefined) return 1;
    return Number(idOf(b)) - Number(idOf(a));
  });
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

export const soldProperties = () =>
  properties.filter((p) => p.status === "vandut" || p.status === "inchiriat");

/** Toate zonele atinse vreodată — inclusiv cele unde nu mai e nimic de vânzare. */
export const neighborhoods = () =>
  [...new Set(properties.map((p) => p.neighborhood))].sort((a, b) => a.localeCompare(b, "ro"));

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

/**
 * Cifrele de pe home, calculate din portofoliul real.
 *
 * Sunt scoase din date intenționat: orice număr scris de mână („128 tranzacții”)
 * devine minciună în momentul în care se schimbă ceva și nimeni nu-și amintește
 * să-l actualizeze. Astea nu pot rămâne în urmă.
 */
export const portfolioStats = () => {
  const live = availableProperties();
  return [
    { value: String(live.length), label: "proprietăți în portofoliu, acum" },
    {
      value: String(live.filter((p) => p.segment === "comercial").length),
      label: "spații comerciale și industriale",
    },
    { value: String(availableNeighborhoods().length), label: "zone din București și Ilfov" },
    { value: "0%", label: "comision pentru cumpărător și chiriaș" },
  ];
};

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
