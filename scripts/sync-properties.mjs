/**
 * Aduce portofoliul lui Vlad de pe site-ul agenției și îl scrie în
 * `src/lib/properties.generated.json`.
 *
 *   node scripts/sync-properties.mjs            # scrie fișierul
 *   node scripts/sync-properties.mjs --dry-run  # doar spune ce s-ar schimba
 *
 * DE UNDE VIN DATELE
 *
 * Fiecare anunț de pe trimbitasu-estate.ro are în pagină un bloc schema.org
 * JSON-LD (`RealEstateListing`) — date structurate, puse acolo special ca să
 * fie citite de mașini. Nu e nevoie de API și nici de credențiale: preț,
 * monedă, vânzare-vs-închiriere, suprafață, camere, băi, an, fotografii și
 * descrierea scrisă de Vlad sunt toate acolo, pe toate anunțurile.
 *
 * CE NU SE POATE CITI DE ACOLO — și de ce există un al doilea strat
 *
 * 1. Zona. Fluxul scrie „Bucuresti” la zece din douăsprezece anunțuri, și fără
 *    diacritice („Varteju”, „Magurele”). Cișmigiu, Grădina Icoanei sau
 *    Roșu – Chiajna nu apar nicăieri. Zona rămâne scrisă de mână.
 * 2. De ce a dispărut un anunț. `availability` e mereu `InStock`; când o
 *    proprietate se vinde, anunțul pur și simplu dispare din listare. Deci
 *    putem ști CĂ a dispărut, nu DACĂ s-a vândut, s-a închiriat sau a fost
 *    retrasă. Scriptul o marchează `listed: false` și atât — „vândut” îl scrie
 *    un om, în `property-overrides.ts`, după ce confirmă Vlad. Un site care
 *    scrie singur „vândut” inventează un fapt; vezi README.
 * 3. Tot ce ține de redacție: titlul nostru, tagline-ul, ce e „featured”,
 *    reperele din jur. Alea sunt scrise de noi și scriptul nu le atinge.
 *
 * FIȘIERUL E CUMULATIV, NU O FOTOGRAFIE A ZILEI
 *
 * Ce a fost văzut o dată rămâne în fișier pentru totdeauna, cu `listed: false`
 * când dispare din listare. Altfel, la prima vânzare am pierde fotografiile și
 * descrierea unei proprietăți — adică exact dovada de track record.
 *
 * DACĂ AGENȚIA ÎȘI SCHIMBĂ SITE-UL
 *
 * Scriptul iese cu eroare și nu scrie nimic. Site-ul rămâne pe ultimele date
 * bune. Se rupe zgomotos, nu tăcut — vezi `assertSane()`.
 */

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const OUT = join(ROOT, "src/lib/properties.generated.json");

/** Listarea filtrată pe Vlad, pe site-ul agenției. */
const AGENT_ID = "5830";
const LISTING = (page) =>
  `https://www.trimbitasu-estate.ro/proprietati/?agent=${AGENT_ID}${page > 1 ? `&page=${page}` : ""}`;

/** Câte pagini de listare acceptăm înainte să bănuim o buclă. */
const MAX_PAGES = 20;
/** Câte anunțuri cerem odată. Peste asta e nepoliticos față de serverul lor. */
const CONCURRENCY = 4;

/**
 * Sub atâtea anunțuri active considerăm că s-a rupt ceva și oprim.
 * În iulie 2026 erau 17. Dacă mâine ies 0 sau 2, cel mai probabil și-au
 * schimbat pagina, nu și-a golit Vlad portofoliul — iar noi n-avem voie să
 * ștergem site-ul pe baza unei presupuneri.
 */
const MIN_EXPECTED = 6;

const dryRun = process.argv.includes("--dry-run");

const UA = "Mozilla/5.0 (compatible; website-vlad sync; +https://github.com/calinnedelcu)";

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res.text();
}

/** Scoate toate blocurile JSON-LD dintr-o pagină, sărind peste cele stricate. */
function jsonLdBlocks(html) {
  const out = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      out.push(JSON.parse(m[1].trim()));
    } catch {
      /* un bloc stricat nu e motiv să pice tot */
    }
  }
  return out;
}

/**
 * Adresele anunțurilor active, din `ItemList`-ul paginilor de listare.
 *
 * CAPCANĂ, verificată pe viu: când ceri o pagină peste câte are agentul,
 * site-ul agenției NU întoarce o listă goală — renunță tăcut la filtrul pe
 * agent și îți dă catalogul întregii agenții. La `?agent=5830` sunt două
 * pagini; `page=3` întoarce cincisprezece anunțuri din Năvodari, ale altcuiva,
 * iar `page=4` le repetă pe aceleași.
 *
 * De aceea ne oprim când o pagină nu mai aduce nicio adresă nouă, nu când
 * întoarce zero. Iar ca să nu depindem de comportamentul ăsta, fiecare anunț
 * e verificat separat că e al lui Vlad — vezi `isVlads()`.
 */
async function collectListingUrls() {
  const seen = new Set();
  for (let page = 1; page <= MAX_PAGES; page++) {
    const html = await fetchText(LISTING(page));
    const list = jsonLdBlocks(html).find((b) => b["@type"] === "ItemList");
    const items = list?.itemListElement ?? [];
    const before = seen.size;
    for (const item of items) if (item.url) seen.add(item.url);
    if (seen.size === before) break;
  }
  return [...seen];
}

/**
 * E anunțul lui Vlad?
 *
 * Singurul semn de încredere din pagină: fotografia agentului, al cărei `alt`
 * e „Vlad Nedelcu - TRÎMBIȚAȘU ESTATE”. Anunțurile altor agenți n-o au.
 * Verificarea asta e plasa care ne apără de scurgerea de la paginare, dacă
 * agenția își schimbă vreodată comportamentul.
 */
function isVlads(html) {
  const re = /<img[^>]*class="[^"]*\bagent-photo\b[^"]*"[^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    const alt = m[0].match(/\balt="([^"]*)"/i)?.[1] ?? "";
    if (/\bVlad\s+Nedelcu\b/i.test(alt)) return true;
  }
  return false;
}

/** Id-ul din CRM, din coada adresei: `...-cp3237398/`. E cheia noastră stabilă. */
const crmId = (url) => url.match(/cp(\d+)/)?.[1] ?? null;

/**
 * Tipul proprietății. Fluxul nu-l dă explicit, dar adresa anunțului îl conține
 * — agenția își construiește URL-urile din el. Ordinea contează: „spatiu de
 * birouri” trebuie verificat înaintea lui „spatiu”.
 */
function kindFromUrl(url) {
  const u = url.toLowerCase();
  if (u.includes("spatiu-de-birouri") || u.includes("birouri")) return "birouri";
  if (u.includes("spatiu-comercial") || u.includes("spatiu-de-vanzare")) return "spatiu comercial";
  if (u.includes("hala") || u.includes("spatiu-industrial") || u.includes("depozit")) return "hala";
  if (u.includes("penthouse")) return "penthouse";
  if (u.includes("vila")) return "vila";
  if (u.includes("casa")) return "casa";
  return "apartament";
}

const COMERCIAL = new Set(["birouri", "spatiu comercial", "hala"]);

/** Descrierea din CRM, ruptă în paragrafe. Rândurile goale sunt separatorii. */
function paragraphs(description) {
  return String(description ?? "")
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

/** Din adresa completă de pe CDN păstrăm doar `<id>/<fișier>`, ca în `properties.ts`. */
const mediaPath = (url) => url.replace(/^https?:\/\/media\.crmrebs\.com\/property_images\//, "");

/** Un anunț, tradus din schema.org în forma pe care o folosim noi. */
function toRecord(url, ld) {
  const id = crmId(url);
  const offer = ld.offers ?? {};
  const kind = kindFromUrl(url);
  const rent = String(offer.businessFunction ?? "").includes("LeaseOut");
  const images = (Array.isArray(ld.image) ? ld.image : [ld.image]).filter(Boolean).map(mediaPath);

  const specs = {};
  const surface = Number(ld.floorSize?.value);
  if (Number.isFinite(surface) && surface > 0) specs.surface = Math.round(surface);
  const rooms = Number(ld.numberOfRooms);
  if (Number.isFinite(rooms) && rooms > 0) specs.rooms = rooms;
  const baths = Number(ld.numberOfBathroomsTotal);
  if (Number.isFinite(baths) && baths > 0) specs.baths = baths;
  const year = Number(ld.yearBuilt);
  if (Number.isFinite(year) && year > 1800) specs.year = year;

  return {
    id,
    listed: true,
    sourceUrl: url,
    sourceTitle: ld.name ?? "",
    kind,
    segment: COMERCIAL.has(kind) ? "comercial" : "rezidential",
    deal: rent ? "inchiriere" : "vanzare",
    price: {
      amount: Number(offer.price) || 0,
      currency: offer.priceCurrency === "RON" ? "RON" : "EUR",
      ...(rent ? { period: "luna" } : {}),
    },
    specs,
    /** Localitatea din flux. Nefolosită direct — vezi nota de sus. */
    sourceLocality: ld.address?.addressLocality ?? "",
    story: paragraphs(ld.description),
    media: { cover: images[0] ?? "", gallery: images.slice(1) },
  };
}

/**
 * Plasa de siguranță. Orice sub pragurile astea înseamnă „pagina lor s-a
 * schimbat”, nu „portofoliul s-a golit”, deci nu scriem nimic.
 */
function assertSane(records) {
  if (records.length < MIN_EXPECTED)
    throw new Error(
      `Doar ${records.length} anunțuri găsite (așteptam cel puțin ${MIN_EXPECTED}). ` +
        `Cel mai probabil s-a schimbat structura paginilor agenției. Nu scriu nimic.`,
    );

  const faraPret = records.filter((r) => !r.price.amount);
  if (faraPret.length > records.length / 4)
    throw new Error(`${faraPret.length} anunțuri fără preț — citirea pare ruptă. Nu scriu nimic.`);

  const faraPoze = records.filter((r) => !r.media.cover);
  if (faraPoze.length) throw new Error(`${faraPoze.length} anunțuri fără nicio fotografie.`);

  const faraId = records.filter((r) => !r.id);
  if (faraId.length) throw new Error(`${faraId.length} anunțuri fără id de CRM în adresă.`);
}

/** Rulează `fn` peste `items`, cel mult `limit` deodată. */
async function pool(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

/* ---------------------------------------------------------------- */

const previous = await readFile(OUT, "utf8")
  .then((t) => JSON.parse(t))
  .catch(() => ({ properties: {} }));

console.log("Citesc listarea agenției…");
const urls = await collectListingUrls();
console.log(`  ${urls.length} anunțuri active`);

let straine = 0;
const records = (
  await pool(urls, CONCURRENCY, async (url) => {
    const html = await fetchText(url);
    if (!isVlads(html)) {
      straine++;
      return null;
    }
    const ld = jsonLdBlocks(html).find((b) => {
      const t = b["@type"];
      return Array.isArray(t) ? t.includes("RealEstateListing") : t === "RealEstateListing";
    });
    if (!ld) {
      console.warn(`  ! fără date structurate: ${url}`);
      return null;
    }
    return toRecord(url, ld);
  })
).filter(Boolean);

if (straine) console.log(`  ${straine} anunțuri ale altor agenți, sărite`);
console.log(`  ${records.length} anunțuri ale lui Vlad`);

assertSane(records);

/* --- Ce s-a schimbat față de data trecută --- */

const acum = Object.fromEntries(records.map((r) => [r.id, r]));
const inainte = previous.properties ?? {};

const noi = records.filter((r) => !inainte[r.id]);
const disparute = Object.values(inainte).filter((p) => p.listed && !acum[p.id]);
const preturi = records
  .filter((r) => inainte[r.id] && inainte[r.id].price.amount !== r.price.amount)
  .map((r) => ({ id: r.id, de_la: inainte[r.id].price.amount, la: r.price.amount }));

/* --- Fișierul, cumulativ: ce a fost văzut o dată rămâne --- */

/**
 * Fotografiile se adună, nu se înlocuiesc.
 *
 * Blocul JSON-LD listează doar cinci imagini, deși anunțul are mai multe —
 * restul galeriei o servește CDN-ul prin căi codate, pe care nu vreau să le
 * ghicesc. Dacă am înlocui galeria la fiecare sincronizare, primul `npm run
 * sync` ar tăia paginile de la nouă fotografii la patru. Așa, ce am adus o
 * dată rămâne, iar ce apare nou se adaugă la coadă.
 *
 * Coperta o ia din flux: dacă Vlad rearanjează pozele în CRM, prima de acolo
 * devine prima și la noi.
 */
function unionMedia(vechi, nou) {
  const cover = nou.cover || vechi?.cover || "";
  const toate = [
    ...(vechi ? [vechi.cover, ...vechi.gallery] : []),
    nou.cover,
    ...nou.gallery,
  ].filter(Boolean);
  return { cover, gallery: [...new Set(toate)].filter((p) => p !== cover) };
}

const merged = { ...inainte };
for (const r of records) {
  merged[r.id] = { ...inainte[r.id], ...r, listed: true, media: unionMedia(inainte[r.id]?.media, r.media) };
}
for (const p of disparute) merged[p.id] = { ...merged[p.id], listed: false };

const raport = {
  noi: noi.map((r) => ({ id: r.id, titlu: r.sourceTitle, url: r.sourceUrl })),
  disparute: disparute.map((p) => ({ id: p.id, titlu: p.sourceTitle, url: p.sourceUrl })),
  preturi,
};

console.log(`\nAnunțuri noi:      ${noi.length}`);
for (const n of raport.noi) console.log(`  + ${n.titlu}`);
console.log(`Dispărute:         ${disparute.length}`);
for (const d of raport.disparute) console.log(`  - ${d.titlu}`);
console.log(`Prețuri schimbate: ${preturi.length}`);
for (const p of preturi) console.log(`  ~ ${p.id}: ${p.de_la} → ${p.la}`);

if (dryRun) {
  console.log("\n--dry-run: n-am scris nimic.");
  process.exit(0);
}

await writeFile(
  OUT,
  JSON.stringify(
    {
      // Ora ultimei citiri reușite. Utilă când te întrebi dacă sincronizarea
      // mai rulează sau a murit tăcut acum trei luni.
      syncedAt: new Date().toISOString(),
      properties: merged,
    },
    null,
    2,
  ) + "\n",
);

console.log(`\nScris: src/lib/properties.generated.json (${Object.keys(merged).length} proprietăți)`);

// Raportul îl citește workflow-ul ca să deschidă o notă când dispare ceva.
await writeFile(join(ROOT, "sync-report.json"), JSON.stringify(raport, null, 2) + "\n");
