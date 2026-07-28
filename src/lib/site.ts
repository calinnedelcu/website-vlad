/**
 * Datele agentului. Singurul loc de editat pentru contact și poziționare.
 *
 * Telefonul, emailul, rolul și portretul sunt cele reale, de pe pagina de
 * echipă a agenției. Cifrele de portofoliu NU se scriu aici — se calculează
 * din `properties.ts`, ca să nu poată rămâne în urmă (vezi `trackRecord`).
 */

import { asset } from "./asset";

export const site = {
  name: "Vlad Nedelcu",
  role: "Agent imobiliar",
  agency: "Trîmbițașu Estate",
  city: "București",
  /** Se schimbă când intră domeniul propriu. Acum e previzualizarea de pe GitHub Pages. */
  url: "https://calinnedelcu.github.io/website-vlad",

  /*
   * Aici era `tagline`, titlul mare de pe prima pagină. A plecat odată cu
   * titlul: la jumătate de ecran nu mai încăpea, iar fraza asta trăiește
   * oricum întreagă în titlul secțiunii „Ce fac”. Dacă vrei un slogan scurt
   * înapoi, scrie-l aici — dar caută-i întâi un loc unde nu repetă altceva.
   */
  intro:
    "Vând și închiriez apartamente în București și Ilfov, și spații industriale și comerciale cu acces din Centură și A0. Comisionul îl plătește proprietarul, nu cumpărătorul sau chiriașul.",

  contact: {
    phone: "+40 750 467 866",
    phoneHref: "tel:+40750467866",
    whatsapp: "https://wa.me/40750467866",
    email: "vlad.nedelcu@trimbitasu-estate.ro",
    /** DE COMPLETAT: adresa biroului agenției. */
    office: "Trîmbițașu Estate, București",
  },

  /**
   * Portretul principal: Vlad la birou, cu sigla agenției în spate. Sursa e
   * `assets/portret-vlad.jpeg`, procesată de `npm run media`.
   */
  portrait: asset("/media/local/portret-vlad.webp"),

  /**
   * Portretul de deschidere: Vlad în costum, la birou. Sursa e
   * `assets/portret-vlad-birou.jpeg`, procesată de `npm run media`.
   * Capul lui stă între 19% și 42% din înălțimea cadrului — de aceea peste tot
   * unde se taie se folosește `object-position: center 20%`.
   */
  portraitOffice: asset("/media/local/portret-vlad-birou.webp"),

  /**
   * Sigla agenției, decupată de pe fundalul ei bleumarin — vezi
   * `scripts/cutout-logo.mjs`. Are canal alfa, deci poate sta pe orice
   * suprafață fără să se vadă un dreptunghi în jurul ei.
   */
  agencyLogo: asset("/media/local/logo-trimbitasu-estate.webp"),

  /**
   * Doar monograma, fără cuvântul-marcă. Asta se folosește pe site.
   *
   * În sigla întreagă, „TRÎMBIȚAȘU ESTATE” ocupă ultimii 32% din înălțime — la
   * mărimea la care stă în banda de deschidere iese la ~7px înălțime de literă
   * pe telefon, majuscule serif cu Î, Ț, Ș. Adică o pată. Iar header-ul scrie
   * aceleași două cuvinte la câțiva centimetri deasupra, cules corect.
   */
  agencyMark: asset("/media/local/logo-trimbitasu-mark.webp"),

  /**
   * Varianta de studio, pe fundal alb, de pe pagina de echipă a agenției.
   * Tăiată curat, deci merge unde e nevoie de un portret mic și neutru.
   * Original: media.crmrebs.com/avatars/11432/b78b0816-e835-4a98-907d-a5d8fbef5af5.jpeg
   */
  portraitStudio: asset("/media/avatars/11432/b78b0816-e835-4a98-907d-a5d8fbef5af5.webp"),

  /** Pagina lui de pe site-ul agenției — sursa pentru tot ce e aici. */
  agencyProfile: "https://www.trimbitasu-estate.ro/proprietati/?agent=5830",

  /**
   * Istoricul complet de tranzacții, filtrat pe el, pe site-ul agenției.
   * În iulie 2026 arăta 54 de rezultate. Pe site-ul ăsta punem doar selecția
   * dată de Vlad — restul se vede acolo, la sursă.
   */
  transactionsUrl: "https://www.trimbitasu-estate.ro/istoric-tranzactii/?agent=5830",

  /** DE COMPLETAT cu conturile reale ale lui Vlad. */
  social: [
    { label: "Instagram", href: "https://instagram.com/" },
    { label: "Facebook", href: "https://facebook.com/" },
    { label: "LinkedIn", href: "https://linkedin.com/" },
  ],
} as const;

export const nav = [
  { href: "/proprietati", label: "Proprietăți" },
  { href: "/tranzactii", label: "Tranzacții" },
  { href: "/despre", label: "Despre" },
  { href: "/contact", label: "Contact" },
] as const;
