/**
 * Prefixul sub care e servit site-ul.
 *
 * Gol în local, `/<nume-repo>` pe GitHub Pages (îl setează workflow-ul).
 * `NEXT_PUBLIC_*` e inlinuit la build, deci merge și pe server, și în client.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Cale către un fișier din `public/`.
 *
 * ATENȚIE, capcană: `next/image` adaugă singur `basePath` doar când trece prin
 * optimizator. Cu `images.unoptimized: true` — obligatoriu pe un host static —
 * loaderul implicit returnează `src` neatins, deci fotografiile ar da 404 pe
 * orice deploy cu prefix. De aceea îl punem noi, într-un singur loc.
 */
export const asset = (path: string) => `${basePath}${path}`;
