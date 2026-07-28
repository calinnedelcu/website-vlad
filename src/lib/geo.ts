/**
 * Unde cade fiecare zonă pe hartă.
 *
 * ATENȚIE, e important: coordonatele de mai jos sunt CENTRE APROXIMATIVE DE
 * ZONĂ, nu adrese. Nu marchează unde e proprietatea, ci în ce parte a orașului
 * se află — exact cât spune și restul site-ului („Reper aproximativ. Adresa
 * exactă nu se publică niciodată.”). Nu le folosi pentru altceva și nu le
 * prezenta ca poziții exacte.
 *
 * `county` NU e aproximativ: e apartenența administrativă, verificabilă. Ea
 * face distincția desenată pe hartă, tocmai pentru că e un fapt, nu o
 * estimare din coordonate.
 *
 * Cheile trebuie să fie identice cu `neighborhood` din `properties.ts`. O zonă
 * fără intrare aici pur și simplu nu apare pe hartă — vezi `PortfolioMap`.
 */
export interface Zone {
  lat: number;
  lng: number;
  county: "bucuresti" | "ilfov";
}

export const zoneCoords: Record<string, Zone> = {
  // București — centru și semicentral
  Cișmigiu: { lat: 44.437, lng: 26.088, county: "bucuresti" },
  "Grădina Icoanei": { lat: 44.4425, lng: 26.1035, county: "bucuresti" },
  Floreasca: { lat: 44.464, lng: 26.102, county: "bucuresti" },
  "Mihai Bravu": { lat: 44.429, lng: 26.133, county: "bucuresti" },
  Văcărești: { lat: 44.404, lng: 26.12, county: "bucuresti" },

  // București — vestul, partea cea mai densă a portofoliului
  Crângași: { lat: 44.456, lng: 26.045, county: "bucuresti" },
  Gorjului: { lat: 44.431, lng: 26.023, county: "bucuresti" },
  Păcii: { lat: 44.435, lng: 26.0, county: "bucuresti" },
  "Bd. Timișoara": { lat: 44.421, lng: 26.023, county: "bucuresti" },
  "Drumul Taberei": { lat: 44.4185, lng: 26.033, county: "bucuresti" },

  // Ilfov
  "Roșu – Chiajna": { lat: 44.446, lng: 25.972, county: "ilfov" },
  Chiajna: { lat: 44.464, lng: 25.962, county: "ilfov" },
  Rudeni: { lat: 44.509, lng: 25.988, county: "ilfov" },
  Voluntari: { lat: 44.493, lng: 26.183, county: "ilfov" },
  Dobroești: { lat: 44.458, lng: 26.183, county: "ilfov" },
  Măgurele: { lat: 44.348, lng: 26.03, county: "ilfov" },
  Vârteju: { lat: 44.356, lng: 26.01, county: "ilfov" },
};

/**
 * Marginile hărții. Trebuie să încapă și conturul real al orașului
 * (lat 44.334–44.541, lng 25.967–26.226), și cea mai depărtată proprietate.
 *
 * DACĂ LE SCHIMBI, rulează din nou `node scripts/fetch-geo.mjs` — conturul e
 * proiectat cu aceleași margini, iar altfel desenul și punctele nu mai cad în
 * același loc.
 */
const BOUNDS = { south: 44.308, north: 44.552, west: 25.9, east: 26.25 };

/** Un grad de latitudine ≈ 111 km peste tot. */
const KM_PER_LAT = 111;

/**
 * Un grad de longitudine se scurtează cu latitudinea. La 44,43° (București)
 * rămân ~79,3 km. Fără corecția asta, orașul ar ieși întins pe orizontală.
 */
const KM_PER_LNG = KM_PER_LAT * Math.cos((44.43 * Math.PI) / 180);

/** Dimensiunile hărții în kilometri — și sistemul de coordonate al SVG-ului. */
export const mapSize = {
  width: (BOUNDS.east - BOUNDS.west) * KM_PER_LNG,
  height: (BOUNDS.north - BOUNDS.south) * KM_PER_LAT,
};

/** Proiecție simplă, în kilometri, cu originea în colțul din stânga-sus. */
export const project = ({ lat, lng }: { lat: number; lng: number }) => ({
  x: (lng - BOUNDS.west) * KM_PER_LNG,
  y: (BOUNDS.north - lat) * KM_PER_LAT,
});

/**
 * Centrul orașului — punctul din care pornește degradeul de sub contur.
 *
 * Aici a fost la un moment dat Centura, desenată ca cerc de rază constantă,
 * din memorie. Un cerc de 11,5 km așeza Măgurele, Vârteju și Chiajna
 * ÎNĂUNTRUL lui — pe dos față de realitate, fix pe argumentul pentru care
 * există harta. Am scos-o, dar au rămas niște puncte plutind în negru: nici
 * hartă, nici informație. Concluzia corectă n-a fost „scoate reperul”, ci „ia
 * geometria adevărată” — vezi `bucharest-shape.ts` și `scripts/fetch-geo.mjs`.
 */
export const cityCentre = project({ lat: 44.4325, lng: 26.1 });
