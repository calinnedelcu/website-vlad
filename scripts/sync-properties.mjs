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
 * 1. Numele bun al zonei. Fluxul scrie „Bucuresti” la douăsprezece din
 *    paisprezece anunțuri. Zona REALĂ se ia din adresa anunțului (vezi
 *    `zoneFromUrl`), iar reperul ei pe hartă se caută singur prin
 *    OpenStreetMap. Ce rămâne de scris de mână e doar numele de casă —
 *    „Roșu – Chiajna”, „Bd. Timișoara” — unde vrem altceva decât zice OSM.
 * 2. Tot ce ține de redacție: titlul nostru, tagline-ul, ce e „featured”,
 *    reperele din jur. Alea sunt scrise de noi și scriptul nu le atinge.
 *
 * DE CE A DISPĂRUT UN ANUNȚ — SE CITEȘTE, NU SE GHICEȘTE
 *
 * În listare, `availability` e mereu `InStock`; când o proprietate pleacă,
 * anunțul dispare. Dar pagina lui NU dispare: răspunde în continuare cu 200, iar
 * în JSON-LD-ul ei `availability` spune ce s-a întâmplat (verificat pe toate
 * cele 58 de anunțuri dispărute din septembrie–noiembrie 2026):
 *
 *   SoldOut        tranzacție încheiată — vândut sau închiriat, după `deal`
 *   Discontinued   retras de pe piață, fără tranzacție
 *   redirect spre o pagină de categorie, sau 404/410
 *                  anunțul a fost șters din CRM (de obicei înlocuit printr-o
 *                  re-listare cu alt id)
 *
 * Scriptul citește asta pentru fiecare anunț dispărut și scrie `outcome`:
 * `sold` | `withdrawn` | `removed`. Ce nu se poate citi (rețea căzută, pagină
 * schimbată) rămâne FĂRĂ `outcome` — iar site-ul îl ascunde. „Nu știu” nu devine
 * niciodată „vândut”. Pagina „Istoric tranzacții” a agenției NU e folosită:
 * paginarea ei se suprapune (un anunț apare pe două pagini, altul se pierde), pe
 * când pagina fiecărui anunț e exactă.
 *
 * `sold` e definitiv. Celelalte se mai verifică zilnic încă `REPROBE_DAYS` zile
 * după dispariție, în caz că agenția trece tranzacția cu întârziere.
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

/** Cât timp după dispariție mai verificăm zilnic dacă s-a schimbat rezultatul. */
const REPROBE_DAYS = 45;

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
  // Terenul are adresa `/teren-de-inchiriat-...`. Fără asta, cădea pe „apartament”
  // (valoarea implicită de la sfârșit) și apărea așa pe site.
  if (/^https?:\/\/[^/]+\/teren/.test(u)) return "teren";
  if (u.includes("spatiu-de-birouri") || u.includes("birouri")) return "birouri";
  if (u.includes("spatiu-comercial") || u.includes("spatiu-de-vanzare")) return "spatiu comercial";
  if (u.includes("hala") || u.includes("spatiu-industrial") || u.includes("depozit")) return "hala";
  if (u.includes("penthouse")) return "penthouse";
  if (u.includes("vila")) return "vila";
  if (u.includes("casa")) return "casa";
  return "apartament";
}

const COMERCIAL = new Set(["birouri", "spatiu comercial", "hala", "teren"]);

/**
 * Zona, citită din adresa anunțului.
 *
 * DE CE NU DIN `addressLocality`: fluxul scrie „Bucuresti” la douăsprezece din
 * paisprezece anunțuri — adică orice e în oraș — și fără diacritice
 * („Magurele”, „Varteju”). Cu atât nu se poate desena nimic pe hartă: toate
 * proprietățile din București ar cădea în același punct, dacă ar cădea undeva.
 *
 * Adresa anunțului, în schimb, o are de fiecare dată. Agenția își construiește
 * URL-urile din zonă:
 *   apartament-3-camere-de-inchiriat-mihai-bravu-bucuresti-cp123  → mihai-bravu
 *   spatiu-industrial-2-camere-de-inchiriat-central-magurele-cp123 → magurele
 *   spatiu-industrial-6-camere-de-inchiriat-rudeni-cp123           → rudeni
 *
 * Regula: ce vine după „-de-vanzare-” sau „-de-inchiriat-”. Dacă se termină în
 * „-bucuresti”, zona e partea dinainte; altfel ultimul segment e localitatea
 * din Ilfov (Măgurele, Voluntari, Rudeni), care e exact granularitatea hărții.
 *
 * Tot de aici iese și județul, și nu e dedus din coordonate: „-bucuresti” în
 * adresă e o afirmație a agenției, nu o estimare a noastră.
 */
function zoneFromUrl(url) {
  const slug = url.replace(/^https?:\/\/[^/]+\//, "").replace(/\/+$/, "").replace(/-cp\d+$/, "");
  const m = slug.match(/-de-(?:vanzare|inchiriat)-(.+)$/);
  if (!m) return null;

  const rest = m[1];

  // „...-adunatii-copaceni-judet-giurgiu”: agenția scrie județul când nu e
  // București sau Ilfov. Harta e doar București–Ilfov, iar fără ramura asta
  // ultimul segment („giurgiu”) era luat drept localitate din Ilfov și căuta un
  // punct — a găsit Jilava, în Ilfov, pentru un teren din județul Giurgiu.
  // Ce e în afara hărții nu primește zonă: rămâne în portofoliu, fără bulă.
  if (/-judet-/.test(rest)) return null;

  if (rest.endsWith("-bucuresti")) {
    const zone = rest.slice(0, -"-bucuresti".length);
    return zone ? { slug: zone, county: "bucuresti" } : null;
  }
  const parts = rest.split("-");
  return { slug: parts[parts.length - 1], county: "ilfov" };
}

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
    /** Localitatea din flux. „Bucuresti” la aproape tot — vezi `zoneFromUrl`. */
    sourceLocality: ld.address?.addressLocality ?? "",
    /** Zona reală, din adresa anunțului. Asta desenează harta. */
    zone: zoneFromUrl(url),
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

/**
 * Ce s-a întâmplat cu un anunț dispărut din listare, citit de pe pagina lui.
 * Vezi „DE CE A DISPĂRUT UN ANUNȚ” sus.
 *
 * Întoarce `sold` | `withdrawn` | `removed`, sau `null` când nu putem ști —
 * rețea căzută, pagină schimbată, sau anunțul e totuși viu (`InStock`, deci
 * doar lipsit din listare). `null` înseamnă „nu schimba nimic”, niciodată
 * „vândut”.
 */
async function probeOutcome(rec) {
  let res;
  try {
    res = await fetch(rec.sourceUrl, { headers: { "User-Agent": UA }, redirect: "follow" });
  } catch {
    return null;
  }
  if (res.status === 404 || res.status === 410) return "removed";
  if (!res.ok) return null;

  // Anunțul șters din CRM nu dă 404: te duce la pagina de categorie
  // (`/apartamente-de-vanzare/bucuresti/militari/`). Adresa finală n-are id-ul.
  if (crmId(res.url) !== rec.id) return "removed";

  const html = await res.text();
  const ld = jsonLdBlocks(html).find((b) => {
    const t = b["@type"];
    return Array.isArray(t) ? t.includes("RealEstateListing") : t === "RealEstateListing";
  });
  const availability = String(ld?.offers?.availability ?? "");
  if (availability.endsWith("/SoldOut")) return "sold";
  if (availability.endsWith("/Discontinued")) return "withdrawn";
  return null;
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
  // Dacă un anunț reapare în listare, ce credeam despre dispariția lui nu mai
  // e valabil — îl scoatem, ca să nu rămână un „vândut” vechi pe ceva activ.
  const rest = { ...inainte[r.id] };
  delete rest.outcome;
  delete rest.outcomeAt;
  delete rest.goneAt;
  merged[r.id] = { ...rest, ...r, listed: true, media: unionMedia(inainte[r.id]?.media, r.media) };
}

/**
 * Zona se recalculează din adresă pentru TOATE anunțurile, nu doar pentru cele
 * active. Câmpul `zone` a apărut după ce 39 de anunțuri erau deja dispărute, iar
 * `...r` îl pune doar pe cele din listare — celelalte rămâneau fără zonă, deci
 * tranzacțiile încheiate își scriau „Bucuresti”, fără cartier. E o funcție pură
 * de adresă, deci recalculul e gratuit și urmează orice regulă îmbunătățită.
 */
for (const p of Object.values(merged)) p.zone = zoneFromUrl(p.sourceUrl);

/* --- Rezultatul pentru ce a dispărut: citit, nu ghicit --- */

const azi = new Date().toISOString().slice(0, 10);
const zileDe = (data) => (Date.now() - new Date(data).getTime()) / 86_400_000;

for (const p of disparute) merged[p.id] = { ...merged[p.id], listed: false };

/** Dispărut și încă neclar, sau neînchis definitiv și încă în fereastra de verificare. */
const dePrivit = Object.values(merged).filter((p) => {
  if (p.listed || p.outcome === "sold") return false;
  if (!p.outcome) return true;
  return zileDe(p.goneAt ?? azi) < REPROBE_DAYS;
});

console.log(`\nVerific pagina a ${dePrivit.length} anunțuri dispărute…`);
const schimbari = [];
await pool(dePrivit, CONCURRENCY, async (p) => {
  const rezultat = await probeOutcome(p);
  const cur = merged[p.id];
  // `goneAt`: data la care am observat prima dată că lipsește. Pentru anunțurile
  // dispărute înainte de existența câmpului, ziua primei verificări.
  const goneAt = cur.goneAt ?? azi;
  if (rezultat && rezultat !== cur.outcome) {
    merged[p.id] = { ...cur, goneAt, outcome: rezultat, outcomeAt: azi };
    schimbari.push({ id: p.id, titlu: p.sourceTitle, url: p.sourceUrl, deal: p.deal, de_la: cur.outcome ?? null, la: rezultat });
  } else if (cur.goneAt !== goneAt) {
    merged[p.id] = { ...cur, goneAt };
  }
});

/**
 * Proprietatea fizică = folderul de fotografii + tipul tranzacției. CRM-ul dă id
 * nou la fiecare re-listare, dar pozele rămân în folderul primei încărcări — la
 * fel ca în `properties.ts`.
 */
const cheieFizica = (p) => `${(p.media?.cover ?? "").split("/")[0]}|${p.deal}`;
const reListate = new Set(Object.values(merged).filter((p) => p.listed).map(cheieFizica));

/**
 * Încă fără rezultat după verificare: omul trebuie să se uite. Nu și când
 * aceeași proprietate e între timp listată sub alt id — atunci e doar o veche
 * versiune a ei, iar site-ul o arată pe cea nouă.
 */
const neclare = Object.values(merged)
  .filter((p) => !p.listed && !p.outcome && !reListate.has(cheieFizica(p)))
  .map((p) => ({ id: p.id, titlu: p.sourceTitle, url: p.sourceUrl }));

const tr = (s) => schimbari.filter((s2) => s2.la === s);
const raport = {
  noi: noi.map((r) => ({ id: r.id, titlu: r.sourceTitle, url: r.sourceUrl })),
  disparute: disparute.map((p) => ({ id: p.id, titlu: p.sourceTitle, url: p.sourceUrl })),
  vandute: tr("sold").filter((s) => s.deal === "vanzare"),
  inchiriate: tr("sold").filter((s) => s.deal === "inchiriere"),
  retrase: [...tr("withdrawn"), ...tr("removed")],
  neclare,
  preturi,
  // Completat mai jos, după căutarea zonelor.
  zoneFaraReper: [],
};

console.log(`\nAnunțuri noi:      ${noi.length}`);
for (const n of raport.noi) console.log(`  + ${n.titlu}`);
console.log(`Dispărute azi:     ${disparute.length}`);
for (const d of raport.disparute) console.log(`  - ${d.titlu}`);
console.log(`Vândute (nou):     ${raport.vandute.length}`);
for (const s of raport.vandute) console.log(`  $ ${s.titlu}`);
console.log(`Închiriate (nou):  ${raport.inchiriate.length}`);
for (const s of raport.inchiriate) console.log(`  = ${s.titlu}`);
console.log(`Retrase (nou):     ${raport.retrase.length}`);
for (const s of raport.retrase) console.log(`  x ${s.titlu} (${s.la})`);
console.log(`Fără rezultat:     ${neclare.length}`);
for (const n of neclare) console.log(`  ? ${n.titlu}`);
console.log(`Prețuri schimbate: ${preturi.length}`);
for (const p of preturi) console.log(`  ~ ${p.id}: ${p.de_la} → ${p.la}`);

if (dryRun) {
  console.log("\n--dry-run: n-am scris nimic.");
  process.exit(0);
}

/**
 * Scriem doar dacă s-a schimbat ceva la portofoliu.
 *
 * Fișierul avea și un `syncedAt` cu ora fiecărei rulări. Suna util — „mai
 * trăiește sincronizarea?” — dar în practică însemna că fișierul se schimba în
 * fiecare zi chiar când Vlad nu atinsese nimic, deci un commit, un build și un
 * deploy zilnic degeaba. Prima rulare automată a și făcut asta: un commit în
 * care singura diferență era ora.
 *
 * Când sincronizarea a rulat ultima oară scrie oricum în istoricul de rulări de
 * pe GitHub, care e locul potrivit pentru asta. Aici ținem doar când s-au
 * schimbat ultima dată chiar datele.
 */
/* ---------- Zonele noi, localizate automat ----------
   Harta desenează dintr-un reper (lat/lng) pe zonă. Reperele scrise de mână
   stau în `src/lib/geo.ts`; cele găsite automat, aici. O zonă fără reper nu
   apare pe hartă — de aceea, până acum, anunțurile noi nu scoteau bule noi.

   Sursa e tot OpenStreetMap, prin Nominatim, ca la conturul orașului
   (`fetch-geo.mjs`) — deci aceeași licență ODbL și aceeași atribuire, deja
   afișată sub hartă. Numele afișat vine tot de la ei, ca să iasă cu
   diacritice: dintr-un slug ca „grozavesti” n-avem cum scoate „Grozăvești”.

   Se cere doar pentru zone nemaivăzute, iar rezultatul rămâne în fișier
   pentru totdeauna. În practică: zero cereri la rulările obișnuite.
   Dacă Nominatim nu găsește zona, NU inventăm un punct — zona rămâne fără
   reper, proprietatea rămâne în portofoliu și harta o raportează ca lipsă. */

const ZONES_OUT = join(ROOT, "src/lib/zones.generated.json");
const zonesPrev = await readFile(ZONES_OUT, "utf8")
  .then((t) => JSON.parse(t))
  .catch(() => ({ zones: {} }));

/** Fără diacritice, litere mici, cratime — ca să comparăm „Măgurele” cu „magurele”. */
const norm = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()
    .replace(/^-|-$/g, "");

/** Reperele scrise de mână — pe alea nu le călcăm niciodată. */
const handWritten = new Set(
  [...(await readFile(join(ROOT, "src/lib/geo.ts"), "utf8")).matchAll(
    /^ {2}(?:"([^"]+)"|([A-Za-z\u00C0-\u024F.\- ]+?)):\s*\{/gm,
  )].map((m) => norm(m[1] ?? m[2])),
);

let ultimaCerere = 0;
async function nominatim(query) {
  const asteapta = 1100 - (Date.now() - ultimaCerere);
  if (asteapta > 0) await new Promise((r) => setTimeout(r, asteapta));
  ultimaCerere = Date.now();
  const url =
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}` +
    `&format=json&limit=1&accept-language=ro`;
  const res = await fetch(url, {
    headers: { "User-Agent": "website-vlad/1.0 (harta portofoliului; contact prin site)" },
  });
  if (!res.ok) return null;
  const [hit] = await res.json();
  return hit ?? null;
}

const zones = { ...zonesPrev.zones };
const zoneNoi = [];
const zoneNegasite = [];

/**
 * Zonele de localizat: ale anunțurilor active ȘI ale tranzacțiilor încheiate,
 * pentru că și acestea își scriu zona pe card. Înainte se căutau doar cele
 * active, iar la închirierile încheiate zona rămânea „Bucuresti”, fără cartier.
 */
const deLocalizat = Object.values(merged).filter((p) => p.listed || p.outcome === "sold");

for (const r of deLocalizat) {
  const z = r.zone;
  if (!z) continue;
  const cheie = norm(z.slug);
  if (handWritten.has(cheie) || zones[cheie]) continue;

  const unde = z.county === "bucuresti" ? "București" : "Ilfov";
  const hit = await nominatim(`${z.slug.replace(/-/g, " ")}, ${unde}, România`);
  if (!hit) {
    zoneNegasite.push(z.slug);
    continue;
  }
  zones[cheie] = {
    // Numele scurt de la OSM, cu diacritice. `display_name` e adresa întreagă.
    name: String(hit.name || hit.display_name.split(",")[0]).trim(),
    lat: Number(Number(hit.lat).toFixed(4)),
    lng: Number(Number(hit.lon).toFixed(4)),
    county: z.county,
  };
  zoneNoi.push(`${zones[cheie].name} (${z.county})`);
}

if (zoneNoi.length) {
  console.log(`\nZone noi, localizate prin OpenStreetMap: ${zoneNoi.length}`);
  for (const n of zoneNoi) console.log(`  + ${n}`);
}
if (zoneNegasite.length) {
  console.log(`\nZone fără reper (rămân în portofoliu, dar nu pe hartă): ${zoneNegasite.join(", ")}`);
}
raport.zoneFaraReper = zoneNegasite;

if (JSON.stringify(zonesPrev.zones ?? {}) !== JSON.stringify(zones)) {
  await writeFile(ZONES_OUT, JSON.stringify({ zones }, null, 2) + "\n");
  console.log(`Scris: src/lib/zones.generated.json (${Object.keys(zones).length} zone)`);
}

/* Abia acum știm dacă e ceva de scris: zonele se caută înaintea verificării,
   fiindcă o rulare poate găsi un reper nou pentru o zonă veche fără ca vreo
   proprietate să se fi schimbat. Dacă ieșeam mai devreme, prima rulare de după
   adăugarea hărții automate n-ar fi localizat nimic. */
const neschimbat =
  JSON.stringify(previous.properties ?? {}) === JSON.stringify(merged) && zoneNoi.length === 0;

if (neschimbat) {
  console.log("\nNimic de scris — portofoliul e la fel ca ultima dată.");
  await writeFile(join(ROOT, "sync-report.json"), JSON.stringify(raport, null, 2) + "\n");
  process.exit(0);
}

await writeFile(
  OUT,
  JSON.stringify(
    { updatedAt: previous.updatedAt && JSON.stringify(previous.properties ?? {}) === JSON.stringify(merged)
        ? previous.updatedAt
        : new Date().toISOString(),
      properties: merged },
    null,
    2,
  ) + "\n",
);

console.log(`\nScris: src/lib/properties.generated.json (${Object.keys(merged).length} proprietăți)`);

// Raportul îl citește workflow-ul ca să deschidă o notă când dispare ceva.
await writeFile(join(ROOT, "sync-report.json"), JSON.stringify(raport, null, 2) + "\n");
