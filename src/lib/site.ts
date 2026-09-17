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
  /**
   * Domeniul propriu, din 17 septembrie 2026. Înainte era previzualizarea de pe
   * GitHub Pages (`calinnedelcu.github.io/website-vlad`).
   *
   * De aici se construiesc adresele absolute: cardul de share, `canonical`,
   * sitemap-ul, robots și datele structurate. Dacă îl schimbi, se schimbă
   * toate odată — de aia e scris într-un singur loc.
   */
  url: "https://vlad-nedelcu.ro",

  /*
   * Paragraful de deschidere de pe prima pagină. A plecat fraza despre
   * comision: acum trăiește o singură dată, în blocul „Reprezentare exclusivă"
   * de deasupra hărții. Aici rămâne doar ce vinde — celelalte două piețe — ca
   * paragraful să nu repete blocul de sub el.
   */
  intro:
    "Vând și închiriez apartamente în București și Ilfov, și spații industriale și comerciale cu acces din Centură și A0.",

  /**
   * Salutul de pe prima pagină, scris de Vlad. Diacriticele sunt corectate față
   * de cum l-a trimis pe WhatsApp („moderna”, „atentia”, „si”) — restul
   * cuvintelor sunt ale lui, neatinse.
   *
   * A avut și o a doua frază — „Prin atenția la detalii și orientarea către
   * rezultate, transform fiecare proprietate într-o oportunitate care merită
   * văzută.” A cerut el s-o înlocuiască cu lista de mai jos. Bun schimb: fraza
   * spunea ceva despre el, lista spune unde să te duci.
   *
   * NU e același lucru cu `intro` de mai sus: ăla are 116 caractere și ține
   * descrierea din Google și de pe cardul de share, unde peste ~160 se taie.
   */
  greeting:
    "Salut! Sunt Nedelcu Vlad, un agent imobiliar dedicat, reprezentant Trîmbițașu Estate, apreciat pentru abordarea modernă, prezentarea premium și promovarea eficientă a proprietăților.",

  /**
   * „Pe site găsești” — cele trei drumuri, scrise de Vlad, ca butoane către
   * paginile lor.
   *
   * El a scris „Meniu Contact” la al treilea. Pe un buton, „Meniu” e cuvântul
   * de prisos: butonul E meniul.
   */
  onSite: [
    { label: "Portofoliul meu activ", href: "/proprietati" },
    { label: "Istoric Vânzări", href: "/tranzactii" },
    { label: "Contact", href: "/contact" },
  ],

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
   * Cele două fotografii din salutul de pe prima pagină, date de Vlad în
   * septembrie 2026. Stau una lângă alta, cum le-a trimis pe WhatsApp.
   *
   * Sunt amândouă în picioare, dar cu rapoarte diferite (0,80 și 0,75), deci
   * nu se pot pune pur și simplu alături fără să iasă una mai înaltă. Caseta
   * le impune același cadru și `object-fit: cover` taie ce prisosește — vezi
   * prima pagină.
   */
  portraitSuit: asset("/media/local/portret-vlad-costum.webp"),
  portraitStreet: asset("/media/local/portret-vlad-strada.webp"),

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
   * NEFOLOSIT PE SITE din septembrie 2026: linkul care trimitea aici stătea în
   * antetul de pe /tranzactii, scos de Calin. Adresa rămâne scrisă fiindcă e
   * reală și utilă — dacă vrei vreodată să pui linkul înapoi, e gata.
   *
   * Istoricul complet de tranzacții, filtrat pe el, pe site-ul agenției.
   * În iulie 2026 arăta 54 de rezultate. Pe site-ul ăsta punem doar selecția
   * dată de Vlad — restul se vede acolo, la sursă.
   */
  transactionsUrl: "https://www.trimbitasu-estate.ro/istoric-tranzactii/?agent=5830",

  /**
   * DE COMPLETAT: Instagram e încă link gol — duce la pagina de start a
   * rețelei, nu la contul lui.
   *
   * Linkurile primite au venit amândouă cu coadă de urmărire — TikTok cu
   * `?_r=1&_t=ZN-99miN9Po1xe`, Facebook cu `?mibextid=wwXIfr`. Alea identifică
   * sesiunea din care a fost copiat linkul, n-au treabă cu profilul, și ar fi
   * ajuns pe un site public. Tăiate.
   *
   * Facebook-ul a venit ca link de share (`/share/1EeCRT4rjp/`). Ăla e un
   * redirect, nu o adresă: aici e ținta lui, adresa canonică a profilului.
   */
  social: [
    { label: "Instagram", href: "https://instagram.com/" },
    { label: "Facebook", href: "https://www.facebook.com/people/Vlad-Nedelcu/100075803291319/" },
    { label: "TikTok", href: "https://www.tiktok.com/@vladnedelcu9" },
  ],
} as const;

/**
 * Meniul. „Acasă” e primul dinadins: până acum drumul înapoi la prima pagină
 * era doar sigla din colț. Pe desktop se vede tot timpul, deci treacă-meargă;
 * pe telefon însă meniul acoperă tot ecranul, sigla dispare sub el, iar din
 * cele patru rânduri niciunul nu ducea acasă. Vlad a intrat undeva din meniu
 * și a rămas acolo — pe bună dreptate.
 *
 * „Despre” a plecat din meniu, iar apoi pagina a fost ștearsă de tot — ambele
 * cerute de Calin. Rămân patru rânduri, toate cu pagină în spate.
 */
/**
 * Tokenul de la Cloudflare Web Analytics.
 *
 * Gol înseamnă „nu măsurăm nimic” — componenta nu randează niciun script. Se ia
 * din contul Cloudflare → Web Analytics → adaugi vlad-nedelcu.ro → îți dă un
 * JS snippet în care scrie `token: "..."`. Doar șirul ăla se pune aici.
 *
 * NU E SECRET. Ajunge oricum în sursa paginii, la vedere, ca orice script de
 * analiză. De aceea stă aici, lângă restul configurației, și nu într-o variabilă
 * de mediu care ar trebui setată și în CI degeaba.
 */
export const analyticsToken = "5d6428320a944542a932d6fe77386bba";

export const nav = [
  { href: "/", label: "Acasă" },
  { href: "/proprietati", label: "Proprietăți" },
  { href: "/tranzactii", label: "Tranzacții" },
  { href: "/contact", label: "Contact" },
] as const;
