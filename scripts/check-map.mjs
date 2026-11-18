/**
 * Verifică că fiecare proprietate din București sau Ilfov are un reper pe hartă,
 * și că reperul cade în marginile ei.
 *
 *   node scripts/check-map.mjs     # iese cu cod 1 și spune care lipsesc
 *
 * DE CE EXISTĂ. O proprietate fără reper nu dă nicio eroare: pur și simplu nu
 * apare pe hartă. Așa au dispărut șase odată, fără să observe nimeni până nu s-a
 * uitat omul. Rulează în workflow imediat după sincronizare, ÎNAINTE de comit și
 * de build — dacă pică, nu se comite nimic și nu se publică nimic, iar site-ul
 * rămâne pe ultima versiune bună (ca la `assertSane()` din sincronizare).
 *
 * Când pică, în afară de rețea căzută, soluția e un rând în `handWritten` din
 * `src/lib/geo.ts` pentru zona numită în mesaj.
 *
 * Proprietățile din afara Bucureștiului și Ilfovului (adresa lor are
 * „-judet-...”) n-au zonă și sunt sărite, intenționat: harta nu le cuprinde.
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const read = (f) => readFile(join(ROOT, f), "utf8");

/** La fel ca `zoneKey` din geo.ts: fără diacritice, litere mici, cratime. */
const norm = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()
    .replace(/^-|-$/g, "");

const geo = await read("src/lib/geo.ts");
const generated = JSON.parse(await read("src/lib/properties.generated.json")).properties;
const zonesGen = JSON.parse(await read("src/lib/zones.generated.json")).zones;

const b = geo.match(/const BOUNDS = \{\s*south:\s*([\d.]+),\s*north:\s*([\d.]+),\s*west:\s*([\d.]+),\s*east:\s*([\d.]+)/);
if (!b) {
  console.error("Nu găsesc BOUNDS în src/lib/geo.ts — s-a schimbat fișierul?");
  process.exit(1);
}
const [south, north, west, east] = b.slice(1).map(Number);

/** Reperele scrise de mână, cu coordonate. Au prioritate, ca în geo.ts. */
const points = new Map();
for (const m of geo.matchAll(/^ {2}(?:"([^"]+)"|([^\s"][^:]*?)):\s*\{\s*lat:\s*([\d.]+),\s*lng:\s*([\d.]+)/gm)) {
  points.set(norm(m[1] ?? m[2]), { name: m[1] ?? m[2], lat: Number(m[3]), lng: Number(m[4]) });
}
for (const [key, z] of Object.entries(zonesGen)) {
  if (!points.has(key)) points.set(key, { name: z.name, lat: z.lat, lng: z.lng });
}

const probleme = [];
for (const p of Object.values(generated)) {
  if (!p.listed || !p.zone) continue;
  const key = norm(p.zone.slug);
  const pt = points.get(key);
  if (!pt) {
    probleme.push(`fără reper: zona „${p.zone.slug}” (${p.sourceTitle}, id ${p.id})`);
  } else if (pt.lat < south || pt.lat > north || pt.lng < west || pt.lng > east) {
    probleme.push(`în afara hărții: „${pt.name}” (${pt.lat}, ${pt.lng}) — ${p.sourceTitle}, id ${p.id}`);
  }
}

if (probleme.length) {
  console.error("Proprietăți care n-ar apărea pe hartă:\n");
  for (const t of probleme) console.error(`  - ${t}`);
  console.error("\nAdaugă zona în `handWritten` din src/lib/geo.ts (sau repară coordonatele).");
  process.exit(1);
}
console.log("Harta: toate proprietățile din București–Ilfov au reper în marginile ei.");
