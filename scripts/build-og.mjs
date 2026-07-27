/**
 * Construiește cardul care apare când cineva dă link-ul pe WhatsApp, Facebook
 * sau oriunde altundeva: `public/og.jpg`, 1200×630.
 *
 * Contează mai mult decât pare. Un agent imobiliar își trimite proprietățile
 * pe WhatsApp de zeci de ori pe zi — fără card, linkul apare ca un rând gri de
 * text. Cu card, apare ca ceva făcut de cineva.
 *
 *   node scripts/build-og.mjs
 *
 * Rulează după `fetch-media.mjs` (are nevoie de fotografii în public/media).
 */

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = new URL("..", import.meta.url).pathname;

const WIDTH = 1200;
const HEIGHT = 630;

/** Fotografia de fundal. Interior cald — merge pentru orice fel de link. */
const BACKDROP = "public/media/property_images/3237398/30c48ff5-e648-4a59-b801-c50f700deba9.webp";

const PAPER = "#f5f3ef";
const BRONZE = "#b08b57";

/** Text randat cu Pango. Georgia ține locul serifului din site pe această imagine. */
async function text(markup, font, width) {
  return sharp({
    text: { text: markup, font, rgba: true, width, align: "left" },
  })
    .png()
    .toBuffer();
}

/** Voal întunecat dinspre stânga, ca textul să stea pe ceva liniștit. */
const scrim = Buffer.from(`
  <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="a" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stop-color="#0b0c0a" stop-opacity="0.94"/>
        <stop offset="55%"  stop-color="#0b0c0a" stop-opacity="0.72"/>
        <stop offset="100%" stop-color="#0b0c0a" stop-opacity="0.35"/>
      </linearGradient>
    </defs>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#a)"/>
    <rect x="72" y="500" width="86" height="2" fill="${BRONZE}"/>
  </svg>
`);

async function main() {
  const backdrop = await readFile(join(ROOT, BACKDROP));

  const base = await sharp(backdrop)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" })
    .toBuffer();

  const eyebrow = await text(
    `<span foreground="${BRONZE}" letter_spacing="4000">AGENT IMOBILIAR · BUCUREȘTI ȘI ILFOV</span>`,
    "Helvetica Bold 20",
    900,
  );
  const name = await text(`<span foreground="${PAPER}">Vlad Nedelcu</span>`, "Georgia 82", 1000);
  const tagline = await text(
    `<span foreground="${PAPER}">Apartamente în București. Hale pe Centură.</span>`,
    "Georgia Italic 34",
    950,
  );
  const contact = await text(
    `<span foreground="#b9b5ad">+40 750 467 866 · Trîmbițașu Estate</span>`,
    "Helvetica 24",
    900,
  );

  const out = await sharp(base)
    .composite([
      { input: scrim, top: 0, left: 0 },
      { input: eyebrow, top: 96, left: 72 },
      { input: name, top: 158, left: 68 },
      { input: tagline, top: 300, left: 72 },
      { input: contact, top: 530, left: 72 },
    ])
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();

  await writeFile(join(ROOT, "public/og.jpg"), out);
  console.log(`public/og.jpg — ${WIDTH}×${HEIGHT}, ${(out.length / 1024).toFixed(0)} KB`);
}

await main();
