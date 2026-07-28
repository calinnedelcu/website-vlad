/**
 * Aduce conturul real al Bucureștiului și al celor șase sectoare, îl proiectează
 * în kilometri și îl scrie ca trasee SVG în `src/lib/bucharest-shape.ts`.
 *
 *   node scripts/fetch-geo.mjs
 *
 * Se rulează rar — granițele administrative nu se schimbă. Rezultatul e comis
 * în repo, deci build-ul nu depinde de rețea.
 *
 * De ce a apărut fișierul ăsta: harta a avut la început Centura desenată ca
 * cerc de rază constantă, din memorie. Punea Măgurele și Chiajna în interiorul
 * orașului — pe dos față de realitate. Am scos cercul, dar au rămas niște
 * puncte plutind în negru, fără niciun reper: nici hartă, nici informație.
 * Concluzia corectă nu era „scoate reperul”, ci „ia geometria adevărată”.
 *
 * Sursa: OpenStreetMap, prin Nominatim. Date sub ODbL — atribuirea e afișată
 * sub hartă și trebuie să rămână acolo.
 */

import fs from "node:fs/promises";

const UA = "website-vlad/1.0 (harta portofoliului; contact prin site)";
const OUT = new URL("../src/lib/bucharest-shape.ts", import.meta.url);

/** Aceleași margini ca în `src/lib/geo.ts`. Dacă le schimbi acolo, schimbă-le și aici. */
const BOUNDS = { south: 44.308, north: 44.552, west: 25.9, east: 26.25 };
const KM_PER_LAT = 111;
const KM_PER_LNG = KM_PER_LAT * Math.cos((44.43 * Math.PI) / 180);

const project = ([lng, lat]) => [
  (lng - BOUNDS.west) * KM_PER_LNG,
  (BOUNDS.north - lat) * KM_PER_LAT,
];

/**
 * Nominatim cere maximum o cerere pe secundă și un User-Agent care să spună
 * cine ești. Respectăm amândouă — e un serviciu gratuit ținut de voluntari.
 */
let lastCall = 0;
async function nominatim(query) {
  const wait = 1100 - (Date.now() - lastCall);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCall = Date.now();

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query,
  )}&format=json&polygon_geojson=1&limit=1`;
  const response = await fetch(url, { headers: { "User-Agent": UA } });
  if (!response.ok) throw new Error(`${query}: HTTP ${response.status}`);

  const [hit] = await response.json();
  if (!hit?.geojson) throw new Error(`${query}: fără geometrie`);
  return hit;
}

/** Scoate inelele exterioare, indiferent dacă vine Polygon sau MultiPolygon. */
const ringsOf = (geojson) =>
  geojson.type === "Polygon" ? [geojson.coordinates[0]] : geojson.coordinates.map((p) => p[0]);

/** Distanța de la P la dreapta AB. */
function perpendicular([px, py], [ax, ay], [bx, by]) {
  const dx = bx - ax;
  const dy = by - ay;
  const length = Math.hypot(dx, dy);
  // Segment degenerat (A și B coincid): distanța devine pur și simplu |PA|.
  if (length === 0) return Math.hypot(px - ax, py - ay);
  return Math.abs(dy * px - dx * py + bx * ay - by * ax) / length;
}

/** Ramer–Douglas–Peucker pe o polilinie deschisă. Toleranța e în kilometri. */
function simplifyOpen(points, tolerance) {
  if (points.length < 3) return points;

  let maxDistance = -1;
  let index = 0;
  const first = points[0];
  const last = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicular(points[i], first, last);
    if (distance > maxDistance) {
      maxDistance = distance;
      index = i;
    }
  }

  if (maxDistance <= tolerance) return [first, last];
  return [
    ...simplifyOpen(points.slice(0, index + 1), tolerance).slice(0, -1),
    ...simplifyOpen(points.slice(index), tolerance),
  ];
}

/**
 * RDP pe un inel închis.
 *
 * Aplicat direct, algoritmul se prăbușește: primul și ultimul punct al unui
 * inel coincid, deci dreapta de referință e un punct, toate distanțele ies
 * zero și rămân două puncte din o mie trei sute. Rupem întâi inelul în două
 * arce, între punctul de start și cel mai depărtat de el, și simplificăm
 * fiecare arc ca polilinie deschisă.
 */
function simplifyRing(ring, tolerance) {
  // Scoatem punctul de închidere, dacă există; îl punem la loc la final.
  const points = ring.slice();
  const [fx, fy] = points[0];
  const [lx, ly] = points[points.length - 1];
  if (points.length > 1 && Math.abs(fx - lx) < 1e-9 && Math.abs(fy - ly) < 1e-9) points.pop();
  if (points.length < 4) return points;

  let far = 0;
  let farDistance = -1;
  for (let i = 1; i < points.length; i++) {
    const distance = Math.hypot(points[i][0] - fx, points[i][1] - fy);
    if (distance > farDistance) {
      farDistance = distance;
      far = i;
    }
  }

  const head = simplifyOpen(points.slice(0, far + 1), tolerance);
  const tail = simplifyOpen(points.slice(far), tolerance);
  return [...head.slice(0, -1), ...tail.slice(0, -1)];
}

const toPath = (points) =>
  points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join("") + "Z";

async function shapeOf(query, tolerance) {
  const hit = await nominatim(query);
  const raw = ringsOf(hit.geojson);
  // Doar inelul cel mai mare: unele relații includ enclave minuscule care, la
  // scara asta, ar fi doar zgomot de câțiva pixeli.
  const biggestRaw = raw.sort((a, b) => b.length - a.length)[0];
  const biggest = simplifyRing(biggestRaw.map(project), tolerance);
  console.log(
    `  ${query}: ${hit.osm_type}/${hit.osm_id} → ${biggestRaw.length} → ${biggest.length} puncte`,
  );
  return toPath(biggest);
}

console.log("Aduc granițele din OpenStreetMap (Nominatim)…");

// Orașul primește o toleranță mai mică: e linia care se vede cel mai bine.
const city = await shapeOf("București, Romania", 0.09);

const sectors = [];
for (let n = 1; n <= 6; n++) {
  sectors.push(await shapeOf(`Sector ${n}, București, Romania`, 0.16));
}

const file = `/**
 * GENERAT DE \`node scripts/fetch-geo.mjs\`. Nu edita de mână.
 *
 * Conturul real al Bucureștiului și al celor șase sectoare, proiectat în
 * kilometri, în același sistem de coordonate ca \`src/lib/geo.ts\`. Dacă schimbi
 * \`BOUNDS\` acolo, rulează scriptul din nou — altfel harta și punctele nu mai
 * cad în același loc.
 *
 * Sursa: OpenStreetMap, sub ODbL. Atribuirea se afișează sub hartă și trebuie
 * să rămână acolo.
 */

/** Limita administrativă a municipiului — linia care desparte orașul de Ilfov. */
export const cityPath = ${JSON.stringify(city)};

/** Cele șase sectoare, în ordine. Desenate subțire, doar ca structură. */
export const sectorPaths = ${JSON.stringify(sectors, null, 2)};
`;

await fs.writeFile(OUT, file);
console.log(`\nScris în src/lib/bucharest-shape.ts (${(file.length / 1024).toFixed(1)} KB)`);
