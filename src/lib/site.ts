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
   * Paragraful de deschidere de pe prima pagină. A plecat fraza despre
   * comision: acum trăiește o singură dată, în blocul „Reprezentare exclusivă"
   * de deasupra hărții. Aici rămâne doar ce vinde — celelalte două piețe — ca
   * paragraful să nu repete blocul de sub el.
   */
  intro:
    "Vând și închiriez apartamente în București și Ilfov, și spații industriale și comerciale cu acces din Centură și A0.",

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

/**
 * Meniul. „Acasă” e primul dinadins: până acum drumul înapoi la prima pagină
 * era doar sigla din colț. Pe desktop se vede tot timpul, deci treacă-meargă;
 * pe telefon însă meniul acoperă tot ecranul, sigla dispare sub el, iar din
 * cele patru rânduri niciunul nu ducea acasă. Vlad a intrat undeva din meniu
 * și a rămas acolo — pe bună dreptate.
 */
export const nav = [
  { href: "/", label: "Acasă" },
  { href: "/proprietati", label: "Proprietăți" },
  { href: "/tranzactii", label: "Tranzacții" },
  { href: "/despre", label: "Despre" },
  { href: "/contact", label: "Contact" },
] as const;
