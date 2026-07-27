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

  tagline: "Apartamente în București. Hale pe Centură.",
  intro:
    "Vânzări și închirieri rezidențiale în București și Ilfov, plus spații industriale și comerciale cu acces direct din Centură și A0. Comision 0% pentru cumpărător și pentru chiriaș.",

  contact: {
    phone: "+40 750 467 866",
    phoneHref: "tel:+40750467866",
    whatsapp: "https://wa.me/40750467866",
    email: "vlad.nedelcu@trimbitasu-estate.ro",
    /** DE COMPLETAT: adresa biroului agenției. */
    office: "Trîmbițașu Estate, București",
  },

  /**
   * Portretul de pe pagina de echipă a agenției — studio, fundal alb, vertical.
   * Adus local de `npm run media`; originalul e la
   * media.crmrebs.com/avatars/11432/b78b0816-e835-4a98-907d-a5d8fbef5af5.jpeg
   */
  portrait: asset("/media/avatars/11432/b78b0816-e835-4a98-907d-a5d8fbef5af5.webp"),

  /** Pagina lui de pe site-ul agenției — sursa pentru tot ce e aici. */
  agencyProfile: "https://www.trimbitasu-estate.ro/proprietati/?agent=5830",

  /** DE COMPLETAT cu conturile reale ale lui Vlad. */
  social: [
    { label: "Instagram", href: "https://instagram.com/" },
    { label: "Facebook", href: "https://facebook.com/" },
    { label: "LinkedIn", href: "https://linkedin.com/" },
  ],
} as const;

export const nav = [
  { href: "/proprietati", label: "Proprietăți" },
  { href: "/despre", label: "Despre" },
  { href: "/contact", label: "Contact" },
] as const;
