/**
 * Găsește folderele de fotografii care țin ACEEAȘI proprietate și scrie
 * `src/lib/photo-twins.generated.json`.
 *
 *   node scripts/photo-twins.mjs      # rulează singur în `npm run media`
 *
 * DE CE EXISTĂ. Site-ul recunoaște o proprietate după folderul ei de fotografii
 * (vezi `properties.ts`). Dar agenția urcă uneori aceleași poze a doua oară, în
 * alt folder — același imobil listat și ca locuință, și ca spațiu comercial, sau
 * pur și simplu de două ori. Două foldere, deci două proprietăți pentru site, și
 * aceeași casă apărea de două ori. Până acum dublura se ascundea de mână
 * (`hidden` în overrides), după ce o observa cineva.
 *
 * Semnalul e conținutul: dacă două foldere au cel puțin `MIN_SHARED` fișiere
 * identice bit cu bit, sunt aceeași proprietate. O singură poză comună nu
 * ajunge — poate fi fațada blocului, folosită la două apartamente diferite.
 *
 * Se compară fișierele locale din `public/media/`, deja redimensionate. Aceeași
 * sursă dă același fișier, deci merge fără să mai descărcăm nimic. Dacă două
 * poze identice ar fi trecut prin versiuni diferite ale convertorului, n-ar mai
 * ieși egale: scapă o dublură (care se poate ascunde de mână), dar nu lipește
 * niciodată două proprietăți diferite.
 *
 * Fișierul leagă fiecare folder-geamăn de cel mai vechi din grupul lui:
 *   { "twins": { "3169311": "3119856" } }
 */

import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const DIR = join(ROOT, "public/media/property_images");
const OUT = join(ROOT, "src/lib/photo-twins.generated.json");

/** Câte fișiere identice fac din două foldere aceeași proprietate. */
const MIN_SHARED = 2;

const folders = (await readdir(DIR, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

/** hash → folderele în care apare fișierul. */
const byHash = new Map();
for (const folder of folders) {
  for (const file of await readdir(join(DIR, folder))) {
    const hash = createHash("sha1").update(await readFile(join(DIR, folder, file))).digest("hex");
    if (!byHash.has(hash)) byHash.set(hash, new Set());
    byHash.get(hash).add(folder);
  }
}

/** Câte fișiere identice are fiecare pereche de foldere. */
const shared = new Map();
for (const set of byHash.values()) {
  const list = [...set].sort();
  for (let i = 0; i < list.length; i++)
    for (let j = i + 1; j < list.length; j++) {
      const key = `${list[i]}|${list[j]}`;
      shared.set(key, (shared.get(key) ?? 0) + 1);
    }
}

/** Union-find: A geamăn cu B și B cu C înseamnă un singur grup. */
const parent = new Map();
const find = (x) => {
  if (!parent.has(x)) parent.set(x, x);
  while (parent.get(x) !== x) {
    parent.set(x, parent.get(parent.get(x)));
    x = parent.get(x);
  }
  return x;
};
for (const [key, n] of shared) {
  if (n < MIN_SHARED) continue;
  const [a, b] = key.split("|");
  parent.set(find(a), find(b));
}

const groups = new Map();
for (const folder of parent.keys()) {
  const root = find(folder);
  if (!groups.has(root)) groups.set(root, []);
  groups.get(root).push(folder);
}

const twins = {};
for (const members of groups.values()) {
  const [oldest, ...rest] = members.sort((a, b) => Number(a) - Number(b));
  for (const folder of rest) twins[folder] = oldest;
}
const sorted = Object.fromEntries(Object.entries(twins).sort(([a], [b]) => Number(a) - Number(b)));

const next = JSON.stringify({ twins: sorted }, null, 2) + "\n";
const prev = await readFile(OUT, "utf8").catch(() => "");
if (next !== prev) await writeFile(OUT, next);

console.log(
  `Foldere cu aceleași fotografii: ${Object.keys(sorted).length}` +
    (Object.keys(sorted).length ? ` (${Object.entries(sorted).map(([a, b]) => `${a}=${b}`).join(", ")})` : ""),
);
