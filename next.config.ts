import type { NextConfig } from "next";

/**
 * GitHub Pages servește un proiect la `https://<user>.github.io/<repo>/`, deci
 * tot ce e absolut are nevoie de prefix. Îl luăm din mediu ca `npm run dev` să
 * rămână curat pe `localhost:3000`; workflow-ul din CI îl setează.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Export static: nu există server, deci nici Server Actions sau optimizare
  // de imagini la cerere. Vezi README.
  output: "export",
  basePath,
  /** Fiecare rută devine un folder cu `index.html` — așa GitHub Pages nu dă 404. */
  trailingSlash: true,

  images: {
    // Fotografiile sunt deja aduse și redimensionate local de
    // `npm run media` (scripts/fetch-media.mjs), în `public/media/`.
    unoptimized: true,
  },
};

export default nextConfig;
