import type { Metadata } from "next";
import { site } from "@/lib/site";

/** Cardul de share. Generat de `npm run media` — vezi scripts/build-og.mjs. */
export const ogImage = {
  url: "/og.jpg",
  width: 1200,
  height: 630,
  alt: `${site.name} — ${site.role} în ${site.city}`,
};

/**
 * Partea din `openGraph` care e la fel pe orice pagină.
 *
 * DE CE EXISTĂ. Metadatele se îmbină superficial: o pagină care scrie
 * `openGraph` înlocuiește TOT obiectul din layout, nu doar câmpurile atinse.
 * Documentația lui `generateMetadata` o spune direct — „All openGraph fields
 * from app/layout.js are replaced” — și tot ea recomandă exact soluția asta:
 * scoți câmpurile comune într-o variabilă și le împrăștii cu `...`.
 *
 * Fără ea aveam de ales între două variante proaste: ori pagina nu-și scria
 * deloc `openGraph` și atunci moștenea cardul primei pagini (adică un link
 * către /proprietati trimis pe WhatsApp arăta titlul și textul de pe acasă),
 * ori și-l scria și pierdea fotografia, limba și numele site-ului.
 */
export const openGraphBase = {
  type: "website",
  locale: "ro_RO",
  siteName: site.name,
  images: [ogImage],
  // `satisfies`, nu adnotare de tip: verifică forma acum, dar păstrează
  // literalele („website", „ro_RO") așa cum le cere `OpenGraph`. Cu `as const`
  // ieșea un tuplu readonly, pe care tipul lor nu-l acceptă.
} satisfies NonNullable<Metadata["openGraph"]>;
