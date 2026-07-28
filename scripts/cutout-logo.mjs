/**
 * Decupează sigla agenției de pe fundalul ei.
 *
 * Sigla vine ca JPEG, auriu pe un bleumarin plat (`rgb(26,29,36)`). Pusă așa
 * peste secțiunile site-ului, s-ar vedea ca un dreptunghi bleumarin lipit pe
 * negru — fundalul nostru e `#0b0c0a`, deci nu se potrivesc. Aici scoatem
 * fundalul și lăsăm doar semnul, cu margini moi.
 *
 * Cum: fiecare pixel e o amestecare între fundal (B) și auriu (F).
 *   P = a·F + (1-a)·B
 * Nu știm F pixel cu pixel, dar știm B, deci deducem opacitatea din cât de
 * departe e pixelul de fundal, apoi „desfacem” amestecul ca să recuperăm
 * culoarea curată. Fără pasul ăsta, marginile ar rămâne cu un halou bleumarin
 * pe orice fundal deschis.
 *
 * Se rulează o singură dată, manual:
 *   node scripts/cutout-logo.mjs <sigla.jpeg>
 * Rezultatul, `assets/logo-trimbitasu-estate.png`, intră în repo și de acolo
 * merge prin `npm run media` ca orice altă fotografie locală.
 */

import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Fundalul plat al fișierului primit de la agenție. */
const BACKGROUND = [26, 29, 36];

/**
 * Sub pragul ăsta considerăm că e fundal curat. JPEG-ul are zgomot de
 * compresie de câteva unități în jurul zonelor aurii; fără prag, fundalul ar
 * ieși cu un praf de pixeli abia vizibili.
 */
const NOISE = 26;

/** Distanța de la fundal la auriul plin — adică opacitate 1. */
const FULL = 210;

const source = process.argv[2];
if (!source) {
  console.error("Dă calea către sigla originală:\n  node scripts/cutout-logo.mjs <fișier>");
  process.exit(1);
}

const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const out = Buffer.alloc(info.width * info.height * 4);

let kept = 0;

for (let i = 0; i < info.width * info.height; i++) {
  const p = i * info.channels;
  const q = i * 4;

  const dr = data[p] - BACKGROUND[0];
  const dg = data[p + 1] - BACKGROUND[1];
  const db = data[p + 2] - BACKGROUND[2];
  const distance = Math.sqrt(dr * dr + dg * dg + db * db);

  const alpha = distance <= NOISE ? 0 : Math.min(1, (distance - NOISE) / (FULL - NOISE));

  if (alpha === 0) {
    out[q] = out[q + 1] = out[q + 2] = out[q + 3] = 0;
    continue;
  }

  kept++;
  // Desfacem amestecul: F = B + (P - B) / a
  out[q] = Math.max(0, Math.min(255, Math.round(BACKGROUND[0] + dr / alpha)));
  out[q + 1] = Math.max(0, Math.min(255, Math.round(BACKGROUND[1] + dg / alpha)));
  out[q + 2] = Math.max(0, Math.min(255, Math.round(BACKGROUND[2] + db / alpha)));
  out[q + 3] = Math.round(alpha * 255);
}

// `trim` scoate marginile devenite transparente: sigla ajunge să umple caseta,
// deci n-avem nevoie de potriveli din CSS ca să pară centrată.
const png = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
  .trim()
  .png()
  .toBuffer();

await writeFile(join(ROOT, "assets/logo-trimbitasu-estate.png"), png);

const full = await sharp(png).metadata();
console.log(`${info.width}×${info.height} → ${full.width}×${full.height}`);
console.log(`pixeli păstrați: ${((kept / (info.width * info.height)) * 100).toFixed(1)}%`);
console.log(`scris: assets/logo-trimbitasu-estate.png (${(png.length / 1024).toFixed(0)} KB)`);

/**
 * Și doar monograma, fără cuvântul-marcă de sub ea.
 *
 * Sigla întreagă are „TRÎMBIȚAȘU ESTATE” scris în ultimii 32% din înălțime. La
 * mărimea la care stă pe site, textul ăla ajunge la ~7px înălțime de literă pe
 * telefon și ~9px pe desktop — majuscule serif cu Î, Ț și Ș, adică o pată, nu
 * un cuvânt. În plus, header-ul scrie aceleași două cuvinte la câțiva
 * centimetri deasupra, cules ca lume.
 *
 * Monograma singură e geometrică și se citește la orice mărime.
 */
const gap = await (async () => {
  const { data: d, info: i } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  const opaque = (y) => {
    let n = 0;
    for (let x = 0; x < i.width; x++) if (d[(y * i.width + x) * 4 + 3] > 40) n++;
    return n / i.width;
  };
  // Primul rând complet gol după jumătatea de sus: acolo se termină semnul.
  for (let y = Math.round(i.height * 0.45); y < i.height; y++) if (opaque(y) < 0.005) return y;
  return i.height;
})();

const mark = await sharp(png)
  .extract({ left: 0, top: 0, width: full.width, height: gap })
  .trim()
  .png()
  .toBuffer();

await writeFile(join(ROOT, "assets/logo-trimbitasu-mark.png"), mark);

const markMeta = await sharp(mark).metadata();
console.log(`scris: assets/logo-trimbitasu-mark.png (${markMeta.width}×${markMeta.height})`);
