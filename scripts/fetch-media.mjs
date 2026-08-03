/**
 * Aduce fotografiile de pe CDN-ul agenției, le redimensionează și le scrie în
 * `public/media/`.
 *
 * De ce există: pe GitHub Pages nu rulează nimic, deci nu există optimizatorul
 * de imagini din Next. Originalele au ~1,9 MB bucata și sunt aproape o sută —
 * servite ca atare, prima pagină ar trage zeci de megabytes. Aici le aducem o
 * singură dată, la o lățime rezonabilă, în webp.
 *
 * Bonus: după ce rulează, site-ul nu mai depinde de serverul agenției.
 *
 *   node scripts/fetch-media.mjs          # sare peste ce există deja
 *   node scripts/fetch-media.mjs --force  # reface tot
 *
 * Sursa adevărului rămâne `src/lib/properties.ts`: scriptul citește de acolo
 * ce fișiere să aducă, ca lista să nu se dubleze în două locuri.
 */

import { mkdir, readFile, readdir, writeFile, access } from "node:fs/promises";
import { basename, dirname, extname, join } from "node:path";
import sharp from "sharp";

const ROOT = new URL("..", import.meta.url).pathname;
const OUT_DIR = join(ROOT, "public", "media");
const CDN = "https://media.crmrebs.com";
/** Fotografii care nu vin de la agenție — portrete, orice dă Vlad direct. */
const ASSETS_DIR = join(ROOT, "assets");

/** Lățimea maximă. Peste asta nu se mai vede diferența pe niciun ecran uzual. */
const MAX_WIDTH = 1600;
const QUALITY = 74;
/** Câte descărcări în paralel. Peste 6 începe să dea rate limit. */
const CONCURRENCY = 6;

const force = process.argv.includes("--force");

/** Extrage căile din `m("folder/fisier.jpg")` și portretul din site.ts. */
async function collectPaths() {
  // Căile vin din fișierul generat de `npm run sync`, nu din `properties.ts`:
  // acolo nu mai există o listă literală de fotografii de când portofoliul se
  // sincronizează singur. Tot o singură sursă, doar că alta.
  const generated = JSON.parse(await readFile(join(ROOT, "src/lib/properties.generated.json"), "utf8"));
  const site = await readFile(join(ROOT, "src/lib/site.ts"), "utf8");

  const propertyPaths = Object.values(generated.properties).flatMap((p) =>
    [p.media.cover, ...p.media.gallery].filter(Boolean).map((path) => `property_images/${path}`),
  );

  // `[^\s"']` și nu `[^"']`: URL-ul apare într-un comentariu, iar fără
  // restricția pe spațiu potrivirea trecea peste rândul următor.
  const portrait = site.match(/media\.crmrebs\.com\/(avatars\/[^\s"']+)/)?.[1];

  return [...new Set([...propertyPaths, ...(portrait ? [portrait] : [])])];
}

/** `property_images/123/abc.jpg` -> `public/media/property_images/123/abc.webp` */
const outputFor = (path) => join(OUT_DIR, path.replace(/\.(jpe?g|png|webp)$/i, ".webp"));

const exists = (path) =>
  access(path).then(
    () => true,
    () => false,
  );

/** Cheia publică a fișierului, așa cum apare în `src` — fără prefixul de deploy. */
const publicPathFor = (path) => `/media/${path.replace(/\.(jpe?g|png|webp)$/i, ".webp")}`;

/**
 * Miniatura neclară care se vede cât se încarcă fotografia mare.
 *
 * 20px lățime, deci câteva sute de bytes — intră direct în HTML ca data URL,
 * fără o cerere separată. E diferența dintre o fotografie care apare brusc și
 * una care „developează”.
 */
async function blurFor(buffer) {
  const tiny = await sharp(buffer)
    .rotate()
    .resize({ width: 20 })
    .webp({ quality: 40 })
    .toBuffer();

  return `data:image/webp;base64,${tiny.toString("base64")}`;
}

async function fetchOne(path) {
  const target = outputFor(path);

  if (!force && (await exists(target))) {
    // Chiar dacă fișierul mare există, avem nevoie de blur pentru hartă.
    const cached = await readFile(target);
    return { path, skipped: true, blur: await blurFor(cached) };
  }

  const response = await fetch(`${CDN}/${path}`);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

  const original = Buffer.from(await response.arrayBuffer());
  const resized = await sharp(original)
    .rotate() // respectă orientarea din EXIF, altfel unele ies culcate
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer();

  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, resized);

  return { path, before: original.length, after: resized.length, blur: await blurFor(resized) };
}

/** Scrie harta de miniaturi ca modul TS, ca să fie tipată și inlinuită la build. */
async function writeBlurMap(blurs) {
  const entries = Object.keys(blurs)
    .sort()
    .map((key) => `  ${JSON.stringify(key)}: ${JSON.stringify(blurs[key])},`)
    .join("\n");

  const contents = `/**
 * GENERAT AUTOMAT de scripts/fetch-media.mjs — nu edita de mână.
 *
 * Miniaturi de 20px, în base64, folosite ca \`blurDataURL\` cât se încarcă
 * fotografia mare. Cheile sunt căile publice, fără prefixul de deploy.
 */

export const blurData: Record<string, string> = {
${entries}
};
`;

  await writeFile(join(ROOT, "src/lib/blur-data.ts"), contents);
}

/**
 * Trece prin aceeași moară fotografiile locale din `assets/`.
 *
 * Ies în `public/media/local/`, cu același tratament ca cele de la agenție:
 * redimensionate, webp, cu miniatură neclară. Ca să adaugi una nouă, o pui în
 * `assets/` și rulezi `npm run media` — nimic de configurat.
 */
async function processLocal(blurs) {
  let files;
  try {
    files = await readdir(ASSETS_DIR);
  } catch {
    return 0; // folderul poate lipsi, e în regulă
  }

  const images = files.filter((file) => /\.(jpe?g|png|webp)$/i.test(file));

  for (const file of images) {
    const source = await readFile(join(ASSETS_DIR, file));
    const name = basename(file, extname(file));
    const target = join(OUT_DIR, "local", `${name}.webp`);

    const resized = await sharp(source)
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer();

    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, resized);
    blurs[`/media/local/${name}.webp`] = await blurFor(resized);
  }

  return images.length;
}

async function main() {
  const paths = await collectPaths();
  console.log(`${paths.length} fișiere de adus${force ? " (--force)" : ""}\n`);

  let done = 0;
  let skipped = 0;
  let before = 0;
  let after = 0;
  const failures = [];
  const blurs = {};

  const queue = [...paths];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    for (let next = queue.shift(); next; next = queue.shift()) {
      try {
        const result = await fetchOne(next);
        blurs[publicPathFor(next)] = result.blur;
        if (result.skipped) {
          skipped += 1;
        } else {
          before += result.before;
          after += result.after;
          done += 1;
        }
      } catch (error) {
        failures.push(`${next} — ${error.message}`);
      }
      const total = done + skipped + failures.length;
      process.stdout.write(`\r  ${total}/${paths.length}`);
    }
  });

  await Promise.all(workers);
  const local = await processLocal(blurs);
  await writeBlurMap(blurs);

  const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);
  console.log(`\n\n  aduse:   ${done}`);
  console.log(`  sărite:  ${skipped}`);
  if (done) console.log(`  mărime:  ${mb(before)} MB -> ${mb(after)} MB`);
  if (local) console.log(`  locale:  ${local} din assets/`);
  console.log(`  blur:    ${Object.keys(blurs).length} miniaturi -> src/lib/blur-data.ts`);

  if (failures.length) {
    console.log(`\n  eșuate: ${failures.length}`);
    for (const failure of failures) console.log(`   - ${failure}`);
    process.exitCode = 1;
  }
}

await main();
