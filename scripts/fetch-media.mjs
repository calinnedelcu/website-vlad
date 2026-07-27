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

import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import sharp from "sharp";

const ROOT = new URL("..", import.meta.url).pathname;
const OUT_DIR = join(ROOT, "public", "media");
const CDN = "https://media.crmrebs.com";

/** Lățimea maximă. Peste asta nu se mai vede diferența pe niciun ecran uzual. */
const MAX_WIDTH = 1600;
const QUALITY = 74;
/** Câte descărcări în paralel. Peste 6 începe să dea rate limit. */
const CONCURRENCY = 6;

const force = process.argv.includes("--force");

/** Extrage căile din `m("folder/fisier.jpg")` și portretul din site.ts. */
async function collectPaths() {
  const properties = await readFile(join(ROOT, "src/lib/properties.ts"), "utf8");
  const site = await readFile(join(ROOT, "src/lib/site.ts"), "utf8");

  const propertyPaths = [...properties.matchAll(/\bm\("([^"]+)"\)/g)].map(
    (match) => `property_images/${match[1]}`,
  );

  const portrait = site.match(/media\.crmrebs\.com\/(avatars\/[^"']+)/)?.[1];

  return [...new Set([...propertyPaths, ...(portrait ? [portrait] : [])])];
}

/** `property_images/123/abc.jpg` -> `public/media/property_images/123/abc.webp` */
const outputFor = (path) => join(OUT_DIR, path.replace(/\.(jpe?g|png|webp)$/i, ".webp"));

const exists = (path) =>
  access(path).then(
    () => true,
    () => false,
  );

async function fetchOne(path) {
  const target = outputFor(path);

  if (!force && (await exists(target))) return { path, skipped: true };

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

  return { path, before: original.length, after: resized.length };
}

async function main() {
  const paths = await collectPaths();
  console.log(`${paths.length} fișiere de adus${force ? " (--force)" : ""}\n`);

  let done = 0;
  let skipped = 0;
  let before = 0;
  let after = 0;
  const failures = [];

  const queue = [...paths];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    for (let next = queue.shift(); next; next = queue.shift()) {
      try {
        const result = await fetchOne(next);
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

  const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);
  console.log(`\n\n  aduse:   ${done}`);
  console.log(`  sărite:  ${skipped}`);
  if (done) console.log(`  mărime:  ${mb(before)} MB -> ${mb(after)} MB`);

  if (failures.length) {
    console.log(`\n  eșuate: ${failures.length}`);
    for (const failure of failures) console.log(`   - ${failure}`);
    process.exitCode = 1;
  }
}

await main();
