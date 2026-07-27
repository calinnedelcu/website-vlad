/**
 * Modelul de proprietate + portofoliul.
 *
 * DATE REALE, preluate din listarea lui Vlad de pe site-ul agenției
 * (`trimbitasu-estate.ro/proprietati/?agent=5830`, citită în iulie 2026).
 * Textele din `story` sunt descrierile scrise de el, nu inventate de noi.
 *
 * Fotografiile sunt servite direct de pe CDN-ul agenției (`media.crmrebs.com`),
 * la rezoluția originală. Agenția folosește REBS CRM — vezi README pentru ce
 * înseamnă asta pentru sincronizarea automată.
 *
 * ATENȚIE la două lucruri, înainte de lansare:
 * 1. Pozele sunt încărcate de pe serverul agenției. De confirmat cu ei că e ok,
 *    altfel se descarcă și se pun pe propriul hosting.
 * 2. Anunțurile de pe site-ul agenției au etichete de zonă greșite (vezi
 *    comentariile de mai jos). Aici sunt corectate după descrieri.
 */

import { asset } from "./asset";

export type Deal = "vanzare" | "inchiriere";
export type Segment = "rezidential" | "comercial";
export type Status = "disponibil" | "rezervat" | "vandut" | "inchiriat";

export type PropertyKind =
  | "apartament"
  | "penthouse"
  | "casa"
  | "vila"
  | "birouri"
  | "spatiu comercial"
  | "hala";

export interface Property {
  slug: string;
  title: string;
  /** Linia editorială de sub titlu — nu specificații, ci caracter. */
  tagline: string;
  kind: PropertyKind;
  deal: Deal;
  segment: Segment;
  status: Status;

  neighborhood: string;
  /** Reper aproximativ. Adresa exactă nu se publică niciodată. */
  area: string;

  price: {
    amount: number;
    currency: "EUR";
    /** Doar la închirieri. */
    period?: "luna";
    /** Ascunde prețul și cere contact — pentru proprietăți discrete. */
    onRequest?: boolean;
  };

  specs: {
    surface: number;
    land?: number;
    rooms?: number;
    baths?: number;
    floor?: string;
    year?: number;
    parking?: number;
  };

  /** Descrierea reală, ruptă în paragrafe. */
  story: string[];
  highlights: string[];
  /** Ce e aproape — doar ce scrie efectiv în anunț, nimic inventat. */
  nearby: { label: string; detail: string }[];

  media: {
    cover: string;
    gallery: string[];
    /** Slot pentru Mux / video walkthrough. */
    video?: string;
    /** Slot pentru embed Matterport / Kuula. */
    tour3d?: string;
  };

  featured?: boolean;
  /** Doar la cele vândute — devine dovada de track record. */
  soldNote?: string;
  /** Anunțul de pe site-ul agenției, pentru verificare. */
  sourceUrl?: string;
  /** Exclusivitate — argument real, folosit de agenție pe fiecare anunț. */
  exclusive?: boolean;
}

/**
 * Fotografiile stau local, în `public/media/`, aduse și redimensionate de
 * `scripts/fetch-media.mjs` (`npm run media`). Căile de mai jos sunt cele
 * originale de pe CDN-ul agenției — scriptul le citește de aici, așa că nu
 * există o a doua listă de întreținut. Extensia se schimbă în `.webp`.
 */
const m = (path: string) =>
  asset(`/media/property_images/${path.replace(/\.(jpe?g|png)$/i, ".webp")}`);

const src = (slug: string) => `https://www.trimbitasu-estate.ro/${slug}/`;

export const properties: Property[] = [
  {
    slug: "cismigiu-cobalcescu-4-camere",
    title: "Patru camere pe Cobălcescu",
    tagline: "Cișmigiu — bloc din 1930, renovat integral în 2020",
    kind: "apartament",
    deal: "vanzare",
    segment: "rezidential",
    status: "disponibil",
    neighborhood: "Cișmigiu",
    area: "Grigore Cobălcescu, Sector 1",
    price: { amount: 180000, currency: "EUR" },
    specs: { surface: 85, rooms: 4, baths: 2, floor: "1 / 3", year: 1930 },
    story: [
      "Vă propunem spre vânzare un apartament de 4 camere situat pe strada Grigore Cobălcescu 54, în zona Cișmigiu. Imobilul în care este situat apartamentul este construit în 1930, din cărămidă, este expertizat U3 și se poate achiziționa și prin credit ipotecar.",
      "Apartamentul este situat la etajul 1 din 3 și se vinde mobilat și utilat complet, ca în fotografiile de prezentare. Distanța până la parcul Cișmigiu este de 500 de metri.",
      "Dotări și îmbunătățiri: 3 aparate de aer condiționat, centrală proprie, instalații electrice și sanitare schimbate, renovare totală în 2020.",
    ],
    highlights: [
      "Renovat integral în 2020",
      "Decomandat, 3 dormitoare, 2 băi",
      "Expertizat U3 — se poate lua credit ipotecar",
      "Mobilat și utilat complet",
      "Centrală proprie, 3 aparate de aer condiționat",
      "Comision 0% pentru cumpărător",
    ],
    nearby: [
      { label: "Parcul Cișmigiu", detail: "500 m — 7 minute pe jos" },
      { label: "Centrul vechi", detail: "la câteva stații" },
      { label: "Transport în comun", detail: "rețea densă de tramvai și metrou" },
    ],
    media: {
      cover: m("3237398/30c48ff5-e648-4a59-b801-c50f700deba9.jpg"),
      gallery: [
        m("3237398/e3436bc3-5a5f-4d35-bcfb-c65c8ac7309c.jpg"),
        m("3237398/f12ee39f-fa8e-4122-a269-fe94d1a9e148.jpg"),
        m("3237398/11a33c71-36fa-452f-86a8-dfacc9d26d46.jpg"),
        m("3237398/20fd7929-189b-4bc4-9377-21ed09d6683a.jpg"),
        m("3237398/147bfaa0-5d1a-445b-bc7e-60ac948efb60.jpg"),
        m("3237398/f9ab15e3-079a-4952-867e-7fa100aacc50.jpg"),
        m("3237398/2044de26-14db-4a00-bcdb-701919f3c8d9.jpg"),
        m("3237398/39374a92-bfb8-4f57-b7f8-2dc636198b63.jpg"),
        m("3237398/4b1202e6-3c11-4b46-895f-35a882dcac4f.jpg"),
      ],
    },
    featured: true,
    exclusive: true,
    sourceUrl: src("apartament-4-camere-de-vanzare-cismigiu-bucuresti-cp3237398"),
  },

  {
    slug: "hala-rudeni-centura",
    title: "Hală și birouri în parc industrial, Rudeni",
    tagline: "Chiajna — acces direct din Centură, 450 mp producție + 120 mp birouri",
    kind: "hala",
    deal: "inchiriere",
    segment: "comercial",
    status: "disponibil",
    neighborhood: "Rudeni",
    area: "Chiajna — Rudeni, acces din Șoseaua de Centură",
    price: { amount: 3250, currency: "EUR", period: "luna" },
    specs: { surface: 550, land: 982, year: 2025 },
    story: [
      "Vă propunem spre închiriere spațiu de depozitare/producție și birouri, situate într-un parc industrial modern, cu infrastructură completă și acces direct din Șoseaua de Centură, în zona Chiajna – Rudeni.",
      "Specificații hală: suprafață depozitare/producție (open space) 450 mp, suprafață construită birouri (P+1) 120 mp, teren aferent 982 mp. Birourile au încălzire/răcire cu sistem tip casetă de tavan, 2 grupuri sanitare, spațiu pentru chicinetă, sală de ședințe și infrastructură pregătită pentru internet, supraveghere video și sistem de alarmă.",
      "Parcul industrial este complet sistematizat, cu facilități moderne și acces facil pentru transport marfă. Spațiul este pregătit pentru utilizare imediată și e potrivit pentru producție, depozitare, distribuție sau e-commerce.",
    ],
    highlights: [
      "450 mp open space + 120 mp birouri pe două niveluri",
      "Teren aferent 982 mp",
      "Acces direct din Șoseaua de Centură",
      "Curent trifazic, apă, canalizare",
      "Sală de ședințe, 2 grupuri sanitare, chicinetă",
      "Pregătit pentru internet, supraveghere video și alarmă",
    ],
    nearby: [
      { label: "Șoseaua de Centură", detail: "acces direct din parc" },
      { label: "Parc industrial", detail: "complet sistematizat, facilități moderne" },
      { label: "Transport marfă", detail: "acces facil pentru tonaj mare" },
    ],
    media: {
      cover: m("3131961/fcbb4b70-931c-4c12-b43f-503d160f3d1b.jpeg"),
      gallery: [
        m("3131961/0a951563-e2cf-4f3d-a4c7-10b36e760951.jpeg"),
        m("3131961/5265859f-4b3e-4d99-8a8b-fedb5b519a5f.jpeg"),
        m("3131961/b59a4023-4118-4311-b7a2-00044b12efea.jpg"),
        m("3131961/74ff9af0-e7ef-4f77-ac30-e19b67a03a89.jpg"),
        m("3131961/568ecb0d-4a66-4469-9e80-2c5a8c97ce23.jpg"),
        m("3131961/198d1f22-85ba-4803-921f-7bc07d24cf0b.jpg"),
        m("3131961/64dd1980-2b80-4727-9642-82f3ce5f32f4.jpg"),
        m("3131961/7e683f98-9c3e-4829-b0b3-46d10d3c4fdd.jpg"),
      ],
    },
    featured: true,
    exclusive: true,
    sourceUrl: src("spatiu-industrial-6-camere-de-inchiriat-rudeni-cp3131961"),
  },

  {
    slug: "asmita-gardens-3-camere",
    title: "Trei camere în Asmita Gardens",
    tagline: "Splaiul Unirii — 105 mp, la 8 minute de metroul Mihai Bravu",
    kind: "apartament",
    deal: "inchiriere",
    segment: "rezidential",
    status: "disponibil",
    neighborhood: "Mihai Bravu",
    area: "Splaiul Unirii — complexul Asmita Gardens",
    price: { amount: 1000, currency: "EUR", period: "luna" },
    specs: { surface: 105, rooms: 3, baths: 2, floor: "2 / 15", year: 2009 },
    story: [
      "Vă propunem spre închiriere un apartament situat la etajul 2 al complexului rezidențial Asmita Gardens, amplasat pe Splaiul Unirii. Apartamentul este spațios, luminos și foarte bine compartimentat, fiind ideal pentru o familie sau pentru persoanele care își doresc o locuință generoasă, într-un complex modern, cu acces facil către centrul orașului.",
      "Proprietatea se află la aproximativ 8 minute de mers pe jos de stația de metrou Mihai Bravu, iar în imediata apropiere se regăsesc supermarketuri, restaurante, săli de fitness, spații verzi și numeroase alte facilități.",
      "Apartamentul se închiriază complet mobilat și utilat, fiind dotat cu toate electrocasnicele necesare pentru un confort sporit și mutare imediată. Separat se poate închiria și un loc de parcare.",
    ],
    highlights: [
      "105 mp utili, decomandat",
      "Terasă",
      "Mobilat și utilat complet",
      "Loc de parcare disponibil separat",
      "Complex cu facilități",
      "Comision 0% pentru chiriaș",
    ],
    nearby: [
      { label: "Metrou Mihai Bravu", detail: "8 minute pe jos" },
      { label: "Supermarketuri și restaurante", detail: "în imediata apropiere" },
      { label: "Săli de fitness și spații verzi", detail: "în complex și în jur" },
    ],
    media: {
      cover: m("3246242/ee2a8c26-86f8-40c4-8125-c705a24562b7.jpeg"),
      gallery: [
        m("3246242/c5b63efd-d9c7-4dbc-97ed-b537fa3f665b.jpeg"),
        m("3246242/bee9627b-8c04-4678-8d03-eb86b55d6848.jpeg"),
        m("3246242/9dd322e3-ea90-46fc-8b69-bdba263df11b.jpeg"),
        m("3246242/8b357d89-7254-4968-9e76-00188edc5830.jpeg"),
        m("3246242/3bd45e38-9ebe-48a5-9b0f-f2e1783aa9ff.jpeg"),
        m("3246242/28b8c71d-1759-4290-bd00-75575c4c1ace.jpeg"),
        m("3246242/2833d078-b96b-46a0-8039-941c110891f6.jpeg"),
        m("3246242/7ce28124-259f-4548-bcbd-832e55548cc4.jpeg"),
      ],
    },
    featured: true,
    exclusive: true,
    sourceUrl: src("apartament-3-camere-de-inchiriat-mihai-bravu-bucuresti-cp3246242"),
  },

  {
    slug: "hala-varteju-a0",
    title: "Hală la cheie, Vârteju",
    tagline: "Ilfov — 1 km de Centură, 4 km de A0",
    kind: "hala",
    deal: "inchiriere",
    segment: "comercial",
    status: "disponibil",
    neighborhood: "Vârteju",
    area: "Vârteju, Ilfov — acces din Șoseaua de Centură",
    price: { amount: 3200, currency: "EUR", period: "luna" },
    specs: { surface: 550, land: 1000, year: 2025 },
    story: [
      "Hala va fi predată viitorului chiriaș „la cheie”. Fotografiile de prezentare au caracter orientativ și sunt destinate exclusiv pentru ilustrarea compartimentării spațiilor de birouri.",
      "Vă propunem spre închiriere un spațiu modern de depozitare/producție și birouri, cu infrastructură completă și acces facil direct din Șoseaua de Centură, în zona Vârteju, județul Ilfov. Proprietatea beneficiază de o amplasare excelentă, fiind situată la doar 1 km de Centura Bucureștiului și 4 km de Autostrada A0, oferind conexiuni rapide către principalele artere de transport.",
      "Specificații: suprafață depozitare/producție (open space) 450 mp, suprafață construită birouri (P+1) 120 mp, suprafață teren 1000 mp. Birourile au sistem de încălzire și răcire cu unități tip casetă de tavan, 2 grupuri sanitare, spațiu pentru chicinetă și sală de ședințe.",
    ],
    highlights: [
      "Predată la cheie",
      "450 mp open space + 120 mp birouri (P+1)",
      "Teren 1000 mp",
      "1 km de Centura Bucureștiului",
      "4 km de Autostrada A0",
      "Comision 0% pentru chiriaș",
    ],
    nearby: [
      { label: "Centura Bucureștiului", detail: "1 km" },
      { label: "Autostrada A0", detail: "4 km" },
      { label: "Acces marfă", detail: "direct din Șoseaua de Centură" },
    ],
    media: {
      cover: m("3163181/e7febc72-f226-4965-9822-f5f8c7a532b5.jpeg"),
      gallery: [
        m("3163181/5ff2f680-a32b-430d-b864-c14a388fab35.jpeg"),
        m("3163181/b332b6fc-3067-41fd-bae0-05a61d6217ae.jpeg"),
        m("3163181/8f496e87-9dbd-4b50-a799-51422905d01c.jpeg"),
        m("3163181/53fe124d-eed3-4688-bbe0-f432d4233b97.jpeg"),
        m("3163181/1d6873d2-7ee4-49e9-b272-243f8ad78548.jpeg"),
        m("3163181/0d86e12c-a620-4c01-be57-43842545b5ff.jpeg"),
        m("3163181/9ef64814-f0e0-4e72-ba60-4d53974378d5.jpeg"),
        m("3163181/488b5971-98f6-439a-9de5-9ac1ae3444b1.jpeg"),
      ],
    },
    featured: true,
    exclusive: true,
    sourceUrl: src("spatiu-industrial-3-camere-de-inchiriat-varteju-cp3163181"),
  },

  {
    slug: "spatiu-comercial-calea-vacaresti",
    title: "Spațiu comercial stradal, Calea Văcărești",
    tagline: "200 mp cu vitrină de 8 metri și trafic pietonal intens",
    kind: "spatiu comercial",
    deal: "inchiriere",
    segment: "comercial",
    status: "disponibil",
    neighborhood: "Văcărești",
    area: "Calea Văcărești, Sector 4",
    price: { amount: 1500, currency: "EUR", period: "luna" },
    specs: { surface: 200, rooms: 6, baths: 2, floor: "parter", year: 1900 },
    story: [
      "Vă propunem spre închiriere un spațiu comercial situat pe Calea Văcărești nr. 251. Spațiul are o suprafață de aproximativ 200 mp, fiind compartimentat conform fotografiilor de prezentare.",
      "Proprietatea este alcătuită din 4 birouri, 2 grupuri sanitare și 2 săli generoase, prin care se realizează accesul către birouri.",
      "Ca punct de reper, proprietatea se află lângă Pizzeria Volare Alegro, la doar 2 minute de mers pe jos de Parcul Lumea Copiilor și la aproximativ 9 minute de stația de metrou Mihai Bravu.",
    ],
    highlights: [
      "Vitrină de 8 metri, stradal",
      "Trafic pietonal intens",
      "4 birouri + 2 săli generoase",
      "2 grupuri sanitare",
      "Imobil consolidat",
      "Video de prezentare disponibil",
    ],
    nearby: [
      { label: "Parcul Lumea Copiilor", detail: "2 minute pe jos" },
      { label: "Metrou Mihai Bravu", detail: "9 minute pe jos" },
      { label: "Vad comercial", detail: "Calea Văcărești, trafic intens" },
    ],
    media: {
      cover: m("3234223/e8c46c9d-057e-4b44-8a37-27a2fbd650e9.jpeg"),
      gallery: [
        m("3234223/09ce87cc-4550-42dc-9e9e-723881efc416.jpeg"),
        m("3234223/edd21862-3bfd-49e6-b117-debde5dfd7f7.jpeg"),
        m("3234223/9c8fb438-6188-4a4f-84da-5f70080ba213.jpeg"),
        m("3234223/446374d6-f1c5-4dfd-8a4e-094c67e27fa6.jpeg"),
        m("3234223/ef3555f1-87ef-4c59-96c8-307d7090501a.jpeg"),
        m("3234223/1a6c9a7a-1762-4c32-8449-83e68b9c4fb5.jpeg"),
        m("3234223/6ee0ee6c-974c-4c6e-a9fb-0b10babcd300.jpeg"),
      ],
    },
    featured: true,
    exclusive: true,
    sourceUrl: src("spatiu-comercial-6-camere-de-inchiriat-vacaresti-bucuresti-cp3234223"),
  },

  {
    slug: "cort-industrial-magurele",
    title: "Cort industrial cu teren, Măgurele",
    tagline: "300 mp acoperiți pe 900 mp de teren, acces TIR",
    kind: "hala",
    deal: "inchiriere",
    segment: "comercial",
    status: "disponibil",
    neighborhood: "Măgurele",
    area: "Măgurele, Ilfov",
    price: { amount: 2500, currency: "EUR", period: "luna" },
    specs: { surface: 350, land: 900, year: 2020 },
    story: [
      "Vă propunem spre închiriere un cort industrial cu o suprafață de 300 mp, amplasat pe un teren de 900 mp, ideal pentru activități de depozitare, logistică, distribuție sau producție ușoară.",
      "Datorită amplasării și suprafeței disponibile, spațiul este potrivit pentru companii care au nevoie de o soluție rapidă și eficientă pentru desfășurarea activității. Acces facil pentru autovehicule de mare tonaj, cu posibilitate de amenajare în funcție de necesitățile chiriașului.",
      "Avantaje: costuri reduse de operare, acces rapid către principalele artere de circulație, spațiu disponibil imediat și curte proprie, ideală pentru activități logistice.",
    ],
    highlights: [
      "300 mp cort industrial + 30 mp birouri",
      "Teren 900 mp, curte proprie",
      "Acces TIR",
      "Curent trifazic (380V)",
      "Costuri reduse de operare",
      "Disponibil imediat",
    ],
    nearby: [
      { label: "Artere principale", detail: "acces rapid" },
      { label: "Curte proprie", detail: "manevră și depozitare exterioară" },
      { label: "Transport în comun", detail: "în zonă" },
    ],
    media: {
      cover: m("3244787/3ddc5a7d-0317-45cb-a58d-e71f5e758cd6.jpeg"),
      gallery: [
        m("3244787/5a5e1a9a-f6f6-447d-909e-cdb4f136bafd.jpeg"),
        m("3244787/a5c00773-cd93-4fad-bb65-50999b0bc62e.jpeg"),
        m("3244787/4d971470-6e56-4f8b-9ec1-de11f88a57c9.jpeg"),
        m("3244787/f2d5ccf8-1f90-434a-b094-eb193dbf7469.jpeg"),
        m("3244787/e88a95c9-68fe-416a-858f-e8e04c8ac1b1.jpeg"),
        m("3244787/c417103d-659b-4d04-910c-c91db309d52a.jpeg"),
        m("3244787/bb7ecbc8-26f5-4ad2-9b24-60790b00f116.jpeg"),
      ],
    },
    exclusive: true,
    sourceUrl: src("spatiu-industrial-2-camere-de-inchiriat-central-magurele-cp3244787"),
  },

  {
    // Anunțul de pe site-ul agenției e etichetat „Militari”, dar descrierea
    // spune Roșu – Chiajna. Aici e trecută zona reală.
    slug: "tineretului-24-rosu-chiajna",
    title: "Trei camere pe Tineretului 24",
    tagline: "Roșu – Chiajna — bloc din 2016, mobilat și utilat complet",
    kind: "apartament",
    deal: "vanzare",
    segment: "rezidential",
    status: "disponibil",
    neighborhood: "Roșu – Chiajna",
    area: "Strada Tineretului, Roșu – Chiajna",
    price: { amount: 92000, currency: "EUR" },
    specs: { surface: 74, rooms: 3, baths: 1, floor: "7 / 8", year: 2016 },
    story: [
      "Vă prezentăm spre vânzare un apartament cu 3 camere, situat pe Strada Tineretului nr. 24, Roșu – Chiajna. Proprietatea este ideală pentru familii tinere, care au un buget bine definit și își doresc mutarea imediată.",
      "Suprafață utilă totală 74 mp: 62 mp plus o terasă închisă de 12 mp. Bloc construit în anul 2016, etaj intermediar 7 din 8, mobilat și utilat complet.",
      "Beneficii de zonă: școli și grădinițe în vecinătate, acces facil către centre comerciale și Centura Bucureștiului, 4 minute până la stația STB.",
    ],
    highlights: [
      "62 mp + terasă închisă de 12 mp",
      "Decomandat, 2 dormitoare",
      "Bloc din 2016, cu lift",
      "Mobilat și utilat complet",
      "Centrală proprie, aer condiționat",
      "Comision 0% pentru cumpărător",
    ],
    nearby: [
      { label: "Stația STB", detail: "4 minute pe jos" },
      { label: "Școli și grădinițe", detail: "în vecinătate" },
      { label: "Centura Bucureștiului", detail: "acces facil" },
    ],
    media: {
      cover: m("3081123/90dedee0-2d09-4c8d-88e2-1bb44c530e30.jpg"),
      gallery: [
        m("3081123/48be6f20-707d-4da6-8022-4e2367d8c0a8.jpg"),
        m("3081123/5987c688-f030-47db-b862-bf07b7f720d0.jpg"),
        m("3081123/f751ce16-9326-4830-b062-cc78327ffdd9.jpg"),
        m("3081123/b6fbc888-8b81-4f2f-9d3b-d446a464c3ec.jpg"),
        m("3081123/62c0a068-826a-4356-8eaf-61d79dd3ab42.jpg"),
        m("3081123/3a728fe3-34d4-48f8-b252-3b451dfc62e1.jpg"),
        m("3081123/068a41bc-5af6-4584-a0c6-d0c771139571.jpg"),
        m("3081123/24adf339-5959-492a-9f26-28fa0d4b442f.jpg"),
      ],
    },
    exclusive: true,
    sourceUrl: src("apartament-3-camere-de-vanzare-militari-bucuresti-cp3081123"),
  },

  {
    // Idem: etichetat „Militari”, descrierea spune Roșu – Chiajna.
    slug: "militari-residence-ilie-petre",
    title: "Trei camere în bloc nou, Ilie Petre",
    tagline: "Roșu – Chiajna — construcție 2024, etaj intermediar",
    kind: "apartament",
    deal: "vanzare",
    segment: "rezidential",
    status: "disponibil",
    neighborhood: "Roșu – Chiajna",
    area: "Strada Ilie Petre, Militari Residence",
    price: { amount: 95000, currency: "EUR" },
    specs: { surface: 66, rooms: 3, baths: 1, floor: "4 / 5", year: 2024 },
    story: [
      "Vă prezentăm spre vânzare un apartament cu 3 camere, situat pe Strada Ilie Petre 8C, Roșu – Chiajna. Proprietatea este ideală pentru familii tinere, care au un buget bine definit și își doresc mutarea imediată.",
      "Suprafață utilă totală 66 mp: 63 mp plus 3 mp balcon. Bloc construit în anul 2024, etaj intermediar 4 din 5.",
      "Beneficii de zonă: școli și grădinițe în vecinătate, acces facil către centre comerciale și Centura Bucureștiului, 4 minute până la stația STB.",
    ],
    highlights: [
      "63 mp + balcon de 3 mp",
      "Bloc din 2024, cărămidă",
      "Decomandat, 2 dormitoare",
      "Centrală proprie",
      "Nemobilat — se amenajează cum vrei",
      "Comision 0% pentru cumpărător",
    ],
    nearby: [
      { label: "Stația STB", detail: "4 minute pe jos" },
      { label: "Școli și grădinițe", detail: "în vecinătate" },
      { label: "Centura Bucureștiului", detail: "acces facil" },
    ],
    media: {
      cover: m("3257960/a646777c-138d-4cff-a100-85e476c31f79.jpg"),
      gallery: [
        m("3257960/0c100953-188b-4dba-ad1a-0659b525e9e9.jpg"),
        m("3257960/a389a3dc-54cf-475e-8617-12c99024b82b.jpg"),
        m("3257960/57912644-d9e4-4e54-a6db-aabdfd935735.jpg"),
        m("3257960/ec9aac63-d131-4164-abd4-d4a16db931bb.jpg"),
        m("3257960/efc8c1df-0f55-4643-a47a-bf5a285921f8.jpg"),
        m("3257960/b714df62-c588-4238-a9bd-12bc50bee99c.jpg"),
        m("3257960/929dbe39-b079-495c-9e12-073519ed84de.jpg"),
      ],
    },
    exclusive: true,
    sourceUrl: src("apartament-3-camere-de-vanzare-militari-bucuresti-cp3257960"),
  },

  {
    slug: "gradina-icoanei-dumbrava-rosie",
    title: "Trei camere pe Dumbrava Roșie",
    tagline: "Grădina Icoanei — nemobilat, pretabil birou sau locuit",
    kind: "apartament",
    deal: "inchiriere",
    segment: "rezidential",
    status: "disponibil",
    neighborhood: "Grădina Icoanei",
    area: "Strada Dumbrava Roșie, Sector 2",
    price: { amount: 700, currency: "EUR", period: "luna" },
    specs: { surface: 50, rooms: 3, floor: "2 / 2", year: 1930 },
    story: [
      "Vă propunem spre închiriere un apartament cu 3 camere, nemobilat, situat pe Strada Dumbrava Roșie nr. 14. Apartamentul este amplasat la etajul 2 din 2 și este pretabil atât pentru activități de birou, cât și pentru locuire, datorită compartimentării și poziționării sale.",
      "Proprietatea se află la prima închiriere, a fost recent igienizată și este pregătită pentru ocupare imediată.",
    ],
    highlights: [
      "Prima închiriere",
      "Recent igienizat",
      "Pretabil birou sau locuință",
      "Ultimul etaj",
      "Zonă liniștită, aproape de Universitate",
      "Comision 0% pentru chiriaș",
    ],
    nearby: [
      { label: "Universitate", detail: "în zonă" },
      { label: "Grădina Icoanei", detail: "la câțiva pași" },
      { label: "Transport în comun", detail: "rețea densă" },
    ],
    media: {
      cover: m("3123651/f3e25518-6ebf-4b64-9e0e-de5ac6d2617b.jpeg"),
      gallery: [
        m("3123651/e8bc4c48-a7f1-4934-82fb-9bffc44da329.jpeg"),
        m("3123651/b4a4525a-152a-43dd-9119-ac48a76156a6.jpeg"),
        m("3123651/733fdbcb-80f1-42e0-875e-cccb3c654b47.jpeg"),
        m("3123651/345f97e7-10a7-4611-9610-98c327390b97.jpeg"),
        m("3123651/7ce318f5-8750-40a0-98ae-7c3e6f60d993.jpeg"),
        m("3123651/5203b12d-0ebb-4083-af30-719d81bfb1f1.jpeg"),
        m("3123651/c19c056e-bf82-4bda-a76b-54609155999b.jpeg"),
      ],
    },
    sourceUrl: src("apartament-3-camere-de-inchiriat-gradina-icoanei-bucuresti-cp3123651"),
  },

  {
    slug: "crangasi-saidac-4-camere",
    title: "Patru camere pe Saidac",
    tagline: "Crângași — nemobilat, pretabil birou sau locuit",
    kind: "apartament",
    deal: "inchiriere",
    segment: "rezidential",
    status: "disponibil",
    neighborhood: "Crângași",
    area: "Strada Locotenent Gheorghe Saidac, Sector 6",
    price: { amount: 650, currency: "EUR", period: "luna" },
    specs: { surface: 80, rooms: 4, baths: 2, floor: "3 / 4", year: 1981 },
    story: [
      "Vă propunem spre închiriere un apartament cu 4 camere, nemobilat, situat pe Strada Locotenent Gheorghe Saidac nr. 4. Apartamentul este amplasat la etajul 3 din 4 și este pretabil atât pentru activități de birou, cât și pentru locuință, datorită compartimentării și poziționării sale.",
      "Proprietatea a fost recent igienizată și este pregătită pentru ocupare imediată.",
    ],
    highlights: [
      "Decomandat, 3 dormitoare, 2 băi",
      "Recent igienizat",
      "Pretabil birou sau locuință",
      "Bloc cu izolație exterioară",
      "Aer condiționat",
      "Comision 0% pentru chiriaș",
    ],
    nearby: [
      { label: "Metrou Crângași", detail: "în zonă" },
      { label: "Lacul Morii", detail: "aproape" },
      { label: "Transport în comun", detail: "la scară" },
    ],
    media: {
      cover: m("3193617/4d0eab48-1371-422c-acb2-b747d16f07d4.jpeg"),
      gallery: [
        m("3193617/9f6cfedc-3cdb-454b-a083-38776e3b8b2b.jpeg"),
        m("3193617/a178c7a3-8198-4b90-aef6-b2dca840d261.jpeg"),
        m("3193617/9c9b083c-4195-4517-ae24-f49262649437.jpeg"),
        m("3193617/cfd48361-da48-44db-90d2-8dd0c1017c92.jpeg"),
        m("3193617/706c9ef6-963a-4e3d-a0cd-e5134e9fa70b.jpeg"),
        m("3193617/02b904e2-a305-449c-a6e5-29722c04c147.jpeg"),
        m("3193617/7c24df99-0ffc-4f45-a933-92131afc021f.jpeg"),
      ],
    },
    exclusive: true,
    sourceUrl: src("apartament-4-camere-de-inchiriat-crangasi-bucuresti-cp3193617"),
  },

  {
    slug: "floreasca-ceaikovski-2-camere",
    title: "Două camere pe Ceaikovski",
    tagline: "Floreasca — renovat, bloc reabilitat, stație în fața scării",
    kind: "apartament",
    deal: "inchiriere",
    segment: "rezidential",
    status: "disponibil",
    neighborhood: "Floreasca",
    area: "Strada Ceaikovski, Sector 1",
    price: { amount: 550, currency: "EUR", period: "luna" },
    specs: { surface: 53, rooms: 2, floor: "1 / 3", year: 1961 },
    story: [
      "Vă propunem spre închiriere un apartament cu 2 camere renovat, situat în zona Floreasca pe strada Ceaikovski, la 20 de minute de mers pe jos de stațiile de metrou Aviatorilor și Ștefan cel Mare, iar stația de autobuz este în fața scării.",
      "Apartamentul este decomandat și se află la etajul 1 din 3, într-un bloc reabilitat. Este mobilat și utilat complet, fiind dotat cu toate electrocasnicele necesare.",
    ],
    highlights: [
      "Renovat, decomandat",
      "Bloc reabilitat termic",
      "Mobilat și utilat complet",
      "Stație de autobuz în fața scării",
      "Etaj 1 din 3",
      "Comision 0% pentru chiriaș",
    ],
    nearby: [
      { label: "Stație de autobuz", detail: "în fața scării" },
      { label: "Metrou Aviatorilor", detail: "20 de minute pe jos" },
      { label: "Metrou Ștefan cel Mare", detail: "20 de minute pe jos" },
    ],
    media: {
      cover: m("3199302/e39faf83-f471-4053-bbd9-7acc84dcea6e.jpeg"),
      gallery: [
        m("3199302/de7a55fb-e5bd-4a78-889d-90228a39d8e2.jpeg"),
        m("3199302/b6c9fd0e-a855-4e57-a095-b24fefd91bf1.jpeg"),
        m("3199302/f84cc371-085b-4548-976b-226d3157c27d.jpeg"),
        m("3199302/f4c9d6c4-fdb9-4c85-984e-5327a7d56212.jpeg"),
        m("3199302/cefc43c9-c014-4e63-87de-7000feee038e.jpeg"),
        m("3199302/7369e481-8237-486e-a1e9-c081c0959ef4.jpeg"),
        m("3199302/9dfe5a53-63c0-4323-9474-f14d02c03ee6.jpeg"),
      ],
    },
    sourceUrl: src("apartament-2-camere-de-inchiriat-floreasca-bucuresti-cp3199302"),
  },

  {
    slug: "voluntari-craiovei-2-camere",
    title: "Două camere în bloc din 2025, Voluntari",
    tagline: "Complet mobilat și utilat, la parter",
    kind: "apartament",
    deal: "inchiriere",
    segment: "rezidential",
    status: "disponibil",
    neighborhood: "Voluntari",
    area: "Strada Craiovei, Voluntari",
    price: { amount: 500, currency: "EUR", period: "luna" },
    specs: { surface: 46, rooms: 2, floor: "parter / 1", year: 2025 },
    story: [
      "Vă propunem spre închiriere un apartament nou cu 2 camere, situat în Voluntari, pe strada Craiovei. Apartamentul este semidecomandat, se află la parterul unui bloc construit în 2025 și este complet mobilat și utilat, fiind dotat cu toate electrocasnicele necesare pentru un confort sporit.",
      "Locuința dispune de centrală termică proprie, mașină de spălat rufe și mașină de spălat vase. Pentru o mai bună înțelegere a compartimentării, se poate pune la dispoziție un videoclip de prezentare.",
    ],
    highlights: [
      "Bloc nou, construit în 2025",
      "Mobilat și utilat complet",
      "Centrală termică proprie",
      "Mașină de spălat rufe și de vase",
      "Parter",
      "Comision 0% pentru chiriaș",
    ],
    nearby: [
      { label: "Voluntari centru", detail: "în zonă" },
      { label: "Acces București", detail: "rapid, prin Pipera / Petricani" },
      { label: "Video de prezentare", detail: "disponibil la cerere" },
    ],
    media: {
      cover: m("3233945/e27fc90e-0575-4f51-861d-5a59ea83c32e.jpeg"),
      gallery: [
        m("3233945/4e526ff1-2411-42c5-b416-78768cb89cac.jpeg"),
        m("3233945/894b7e84-69bd-43a5-b3e4-2fed185c7fab.jpeg"),
        m("3233945/2fbc3ee9-5ed6-42af-89f6-b52e919c95b8.jpeg"),
        m("3233945/f8260ae4-5afa-41c3-bba2-dc57c15b3c83.jpeg"),
        m("3233945/531036dd-a37b-462a-b91a-833331a045a3.jpeg"),
      ],
    },
    sourceUrl: src("apartament-2-camere-de-inchiriat-central-voluntari-cp3233945"),
  },

  /* ============================================================
     TRANZACȚII ÎNCHEIATE
     Cele opt de mai jos sunt selecția dată de Vlad. Istoricul complet e pe
     site-ul agenției — vezi `site.transactionsUrl`.
     Prețurile sunt cele CERUTE la listare, nu cele de vânzare (agenția nu le
     publică). De aceea apar tăiate pe card, nu prezentate ca preț final.
     ============================================================ */

  {
    slug: "plaza-4-camere-timisoara",
    title: "Patru camere vizavi de Plaza",
    tagline: "Bd. Timișoara — renovat complet, mobilat și utilat",
    kind: "apartament",
    deal: "vanzare",
    segment: "rezidential",
    status: "vandut",
    neighborhood: "Bd. Timișoara",
    area: "Aleea Dumbrăvița, lângă Plaza România",
    price: { amount: 137000, currency: "EUR" },
    specs: { surface: 62, rooms: 4, baths: 2, floor: "6 / 10", year: 1974 },
    story: [
      "Apartament mobilat și utilat complet, situat vizavi de Plaza Mall, pe Aleea Dumbrăvița nr. 1, la etajul 6, într-un imobil cu regim de înălțime P+10.",
      "Se preda mobilat și utilat complet, exact ca în fotografiile de prezentare. Recent renovat, cu centrală termică proprie. Proprietatea era ideală pentru o familie care voia să se mute imediat, fără să investească timp și energie în renovări.",
    ],
    highlights: [
      "Renovat recent, finisaje 2022",
      "Mobilat și utilat complet",
      "Centrală termică proprie",
      "3 dormitoare, 2 băi",
      "Comision 0% pentru cumpărător",
    ],
    nearby: [
      { label: "Plaza Mall", detail: "300 m" },
      { label: "Metrou Tudor Vladimirescu", detail: "700 m" },
      { label: "Școală și grădiniță", detail: "100 m" },
    ],
    media: {
      cover: m("3006898/b709ed3e-371a-45fc-9316-0d77957af5e7.jpg"),
      gallery: [
        m("3006898/ff7372ec-3198-47ad-816d-764806efd98d.jpg"),
        m("3006898/d5cdfe0d-d4fc-4232-972c-10d79c61e564.jpg"),
        m("3006898/fd2d8c89-1037-474d-a983-38d511908396.jpg"),
        m("3006898/53da9fe4-06c0-4808-9950-07539b99c2f6.jpg"),
        m("3006898/d4652413-7e83-452f-bbb4-f11057529c50.jpg"),
        m("3006898/d991ab88-d55a-4cdd-8c4a-659aaccab6a0.jpg"),
        m("3006898/1374995f-6157-4516-b2cf-0866af681fa0.jpg"),
        m("3006898/b1666c51-4426-4e42-9760-fe5e870cfd5a.jpg"),
      ],
    },
    sourceUrl: src("apartament-4-camere-de-vanzare-timisoara-bucuresti-cp3006898"),
  },

  {
    slug: "dobroesti-platanii-3-camere",
    title: "Trei camere în Platanii Residence",
    tagline: "Dobroești — 89 mp total, cu loc de parcare",
    kind: "apartament",
    deal: "vanzare",
    segment: "rezidential",
    status: "vandut",
    neighborhood: "Dobroești",
    area: "Strada Stejarului, complexul Platanii Residence",
    price: { amount: 115000, currency: "EUR" },
    specs: { surface: 78, rooms: 3, baths: 2, floor: "2 / 4", year: 2018, parking: 1 },
    story: [
      "Apartament modern pe Strada Stejarului nr. 109, într-un cadru liniștit, ferit de agitația bulevardelor. Face parte din complexul Platanii Residence, un ansamblu apreciat pentru atmosfera familială.",
      "Decomandat, la etajul 2 din 4, într-un imobil cu lift finalizat în 2018. Se vindea complet mobilat și utilat, așa că noul proprietar se putea muta imediat, fără costuri suplimentare. Suprafață utilă 78 mp, 89 mp în total.",
    ],
    highlights: [
      "78 mp utili, 89 mp total",
      "Decomandat, 2 dormitoare, 2 băi",
      "Loc de parcare inclus",
      "Mobilat și utilat complet",
      "Imobil din 2018, cu lift",
      "Comision 0% pentru cumpărător",
    ],
    nearby: [
      { label: "Complexul Platanii Residence", detail: "ansamblu liniștit, familial" },
      { label: "Zonă în dezvoltare", detail: "Dobroești — Fundeni" },
      { label: "Acces", detail: "retras de bulevard" },
    ],
    media: {
      cover: m("2805124/805c1dc9-b37d-4a48-a2ff-0976d0761b07.jpg"),
      gallery: [
        m("2805124/9749c4f9-8be2-436c-9690-640fc7f82a99.jpg"),
        m("2805124/ec301463-43bb-4c61-a9eb-52cb75437209.jpg"),
        m("2805124/44c8b016-bf73-42c2-9e1b-4e2998b3f38d.jpg"),
        m("2805124/07e69f0b-6287-4663-b9cc-fd6a03653358.jpg"),
        m("2805124/0e831ae1-006b-4648-b5a2-06d7241e85cd.jpg"),
        m("2805124/faecd059-219f-4d18-8516-230ddad6278d.jpg"),
        m("2805124/45d84cd2-29c4-4ee2-8997-984561b9a0c3.jpg"),
      ],
    },
    sourceUrl: src("apartament-3-camere-de-vanzare-dobroesti-cp2805124"),
  },

  {
    slug: "gorjului-3-camere-rasaritului",
    title: "Trei camere la cinci minute de metrou",
    tagline: "Gorjului — două balcoane, instalații schimbate",
    kind: "apartament",
    deal: "vanzare",
    segment: "rezidential",
    status: "vandut",
    neighborhood: "Gorjului",
    area: "Strada Răsăritului, Sector 6",
    price: { amount: 115000, currency: "EUR" },
    specs: { surface: 68, rooms: 3, baths: 2, floor: "5 / 10", year: 1981 },
    story: [
      "Apartament cu 3 camere pe strada Răsăritului nr. 6, într-o zonă foarte bine conectată: 5 minute de mers pe jos până la stația de metrou Gorjului și 9 minute până la Lujerului.",
      "Semidecomandat, cu două balcoane, la etajul 5 din 10, într-un imobil construit în 1981. Se vindea complet mobilat și utilat, cu toate electrocasnicele. Instalațiile electrice și sanitare fuseseră schimbate.",
    ],
    highlights: [
      "Două balcoane",
      "Instalații electrice și sanitare schimbate",
      "Mobilat și utilat complet",
      "3 camere, 2 băi",
      "Comision 0% pentru cumpărător",
    ],
    nearby: [
      { label: "Metrou Gorjului", detail: "5 minute pe jos" },
      { label: "Metrou Lujerului", detail: "9 minute pe jos" },
      { label: "Școli și grădinițe", detail: "în vecinătate" },
    ],
    media: {
      cover: m("2926910/aa6aa689-f265-469b-822c-c733e17c83ea.jpg"),
      gallery: [
        m("2926910/58679b31-641e-4b2b-9bc0-190180a75232.jpg"),
        m("2926910/4bb81847-8b9c-4bf9-8dca-0c57e904cbb5.jpg"),
        m("2926910/7002a25a-a5e9-4abc-a67c-e310b7ad9a66.jpg"),
        m("2926910/82b690ee-40ec-4c73-ab4e-1cf2a9eb84db.jpg"),
        m("2926910/c3aed7ac-aa5b-4c22-9740-f53f79c90f69.jpg"),
        m("2926910/432c4d62-89e7-463c-8175-9d46ede2eb93.jpg"),
        m("2926910/1fbc96a0-6ef2-40ad-9f00-0238ae1da79e.jpg"),
      ],
    },
    sourceUrl: src("apartament-3-camere-de-vanzare-gorjului-bucuresti-cp2926910"),
  },

  {
    slug: "drumul-taberei-cetatea-histriei",
    title: "Trei camere pe Cetatea Histriei",
    tagline: "Drumul Taberei — bloc reabilitat termic, logie de 4 mp",
    kind: "apartament",
    deal: "vanzare",
    segment: "rezidential",
    status: "vandut",
    neighborhood: "Drumul Taberei",
    area: "Strada Cetatea Histriei, Sector 6",
    price: { amount: 100000, currency: "EUR" },
    specs: { surface: 65, rooms: 3, baths: 1, floor: "3 / 4", year: 1971 },
    story: [
      "Apartament cu 3 camere, mobilat și utilat complet, în cartierul Drumul Taberei, pe strada Cetatea Histriei nr. 10. Suprafață utilă de 61 mp, plus o logie de 4 mp — 65 mp în total.",
      "Etajul 3 dintr-un bloc cu 4 etaje, construit în 1971 și reabilitat termic. La 7 minute de mers pe jos e Parcul Drumul Taberei, iar la 6 minute stația de metrou Romancierilor. La parterul blocului se află Policlinica Drumul Taberei.",
    ],
    highlights: [
      "Decomandat, 61 mp + logie de 4 mp",
      "Bloc reabilitat termic",
      "Mobilat și utilat complet",
      "Policlinică la parterul blocului",
      "Comision 0% pentru cumpărător",
    ],
    nearby: [
      { label: "Metrou Romancierilor", detail: "6 minute pe jos" },
      { label: "Parcul Drumul Taberei", detail: "7 minute pe jos" },
      { label: "Școli și grădinițe", detail: "Școala nr. 169, Grădinița nr. 209" },
    ],
    media: {
      cover: m("2858886/b6921442-016f-4efe-b087-ed5d9a0c1705.jpg"),
      gallery: [
        m("2858886/faa71c1b-9db7-4f72-b601-50978f1551a4.jpg"),
        m("2858886/6297888e-2100-42e1-9fad-76f0c74dd1f7.jpg"),
        m("2858886/0a97011c-eabd-4768-86cd-8e02968b1350.jpg"),
        m("2858886/8e5a259c-d5dd-4089-a906-3d049190151e.jpg"),
        m("2858886/73438cfd-b839-404d-8b2c-e18f60678076.jpg"),
        m("2858886/b1ead768-be06-4d30-aa00-c85c15db412a.jpg"),
        m("2858886/42aca421-e703-419f-acdc-aeabb6d5f62d.jpg"),
      ],
    },
    sourceUrl: src("apartament-3-camere-de-vanzare-valea-ialomitei-bucuresti-cp2861711"),
  },

  {
    slug: "pacii-garsoniera-belsugului",
    title: "Garsonieră în bloc din 2020",
    tagline: "Păcii — mobilată și utilată, Lidl în fața blocului",
    kind: "apartament",
    deal: "vanzare",
    segment: "rezidential",
    status: "vandut",
    neighborhood: "Păcii",
    area: "Drumul Belșugului, Sector 6",
    price: { amount: 79900, currency: "EUR" },
    specs: { surface: 35, rooms: 1, baths: 1, floor: "parter / 10", year: 2020 },
    story: [
      "Garsonieră pe Strada Drumul Belșugului nr. 23, la 12 minute de mers pe jos până la stația de metrou Păcii. Ideală pentru un student sau un cuplu care își dorea mutarea imediată.",
      "Se vindea mobilată și utilată complet, exact ca în fotografiile de prezentare. Bloc construit în 2020, centrală proprie, parcare liberă în complex.",
    ],
    highlights: [
      "Bloc din 2020",
      "Mobilată și utilată complet",
      "Centrală proprie",
      "Parcare liberă în complex",
      "Comision 0% pentru cumpărător",
    ],
    nearby: [
      { label: "Metrou Păcii", detail: "12 minute pe jos" },
      { label: "Lidl", detail: "în fața blocului" },
      { label: "Politehnica, Plaza România, AFI", detail: "acces facil" },
    ],
    media: {
      cover: m("3069371/9e2e4d25-ffd2-4b3c-858b-7d95f3c9762f.jpg"),
      gallery: [
        m("3069371/1d347067-68db-4788-ba7d-b39d7f0e8a59.jpg"),
        m("3069371/57d6007f-d054-4f33-908c-6ddc3e9b9038.jpg"),
        m("3069371/6ecd1951-aee1-4e03-9df0-2c298bb77401.jpg"),
        m("3069371/21576615-1bff-43b1-a621-b7b984efa081.jpg"),
        m("3069371/ec637448-0672-484a-a8eb-76c7a9eec932.jpg"),
        m("3069371/4b77cbfe-e0ea-4034-96d5-eded3c62519f.jpg"),
        m("3069371/b0c57d18-a603-405b-b9c8-8a81a74161e7.jpg"),
      ],
    },
    sourceUrl: src("apartament-o-camera-de-vanzare-militari-bucuresti-cp3117764"),
  },

  {
    slug: "drumul-taberei-prelungirea-ghencea",
    title: "Două camere pe Prelungirea Ghencea",
    tagline: "Drumul Taberei — retras de bulevard, gata de mutare",
    kind: "apartament",
    deal: "vanzare",
    segment: "rezidential",
    status: "vandut",
    neighborhood: "Drumul Taberei",
    area: "Strada Prelungirea Ghencea, Sector 6",
    price: { amount: 60000, currency: "EUR" },
    specs: { surface: 41, rooms: 2, baths: 1, floor: "parter / 10", year: 1969 },
    story: [
      "Apartament cu 2 camere, confort 2, pe Strada Prelungirea Ghencea nr. 30, la parterul unui imobil cu 10 etaje, reabilitat termic, construit în 1969.",
      "Se vindea complet mobilat și utilat, conform fotografiilor și prezentării virtuale — pregătit pentru mutare imediată sau pentru investiție. Imobilul e retras de la bulevard, deci liniștit, în ciuda apropierii de principalele puncte de interes ale zonei.",
    ],
    highlights: [
      "Decomandat",
      "Bloc reabilitat termic",
      "Mobilat și utilat complet",
      "Retras de bulevard",
      "Comision 0% pentru cumpărător",
    ],
    nearby: [
      { label: "Metrou Râul Doamnei", detail: "8 minute pe jos" },
      { label: "Transport în comun", detail: "acces rapid" },
      { label: "Zonă", detail: "liniștită, retrasă de bulevard" },
    ],
    media: {
      cover: m("2861201/afe3cc9f-a956-4dfa-a0c4-11cb93a07506.jpg"),
      gallery: [
        m("2861201/5df1f892-9d65-4d87-9936-b4c267bb6b70.jpg"),
        m("2861201/2deeb4ea-58dd-4e46-8dbd-82502264b597.jpg"),
        m("2861201/b8d5066d-dd6a-43b6-8cb8-caa0194b47b1.jpg"),
        m("2861201/1722fc52-1b04-4a69-a8df-598edaf1994e.jpg"),
        m("2861201/8b9a6606-9275-4a2e-8395-b6036b7577f5.jpg"),
        m("2861201/17f22720-c85a-473f-99e3-47198de9f8ff.jpg"),
        m("2861201/3b5293c3-e928-4da7-bb33-bc8c8c2592fd.jpg"),
      ],
    },
    sourceUrl: src("apartament-2-camere-de-vanzare-drumul-taberei-bucuresti-cp2861201"),
  },

  {
    slug: "rosu-chiajna-bacriului-2-camere",
    title: "Două camere pe Drumul Bacriului",
    tagline: "Roșu – Chiajna — decomandat, bloc din 2010",
    kind: "apartament",
    deal: "vanzare",
    segment: "rezidential",
    status: "vandut",
    neighborhood: "Roșu – Chiajna",
    area: "Drumul Bacriului, Roșu – Chiajna",
    price: { amount: 53000, currency: "EUR" },
    specs: { surface: 53, rooms: 2, baths: 1, floor: "demisol / 3", year: 2010 },
    story: [
      "Apartament cu 2 camere pe Drumul Bacriului nr. 44C, Roșu – Chiajna. Ideal pentru cupluri tinere cu un buget bine definit, care voiau să își amenajeze locuința după propriul gust.",
      "Decomandat — accesul în fiecare cameră se face din hol. Situat la demisol din 3, cu geamuri mari și fără urme de igrasie, mucegai sau infiltrații. Suprafață utilă 53 mp, bloc construit în 2010. Se putea achiziționa separat și un loc de parcare suprateran.",
    ],
    highlights: [
      "Decomandat",
      "Geamuri mari, fără igrasie sau infiltrații",
      "Bloc din 2010",
      "Centrală proprie",
      "Loc de parcare disponibil separat",
      "Comision 0% pentru cumpărător",
    ],
    nearby: [
      { label: "Roșu – Chiajna", detail: "zonă rezidențială" },
      { label: "Acces București", detail: "prin Militari" },
      { label: "Parcare", detail: "suprateran, separat" },
    ],
    media: {
      cover: m("2991262/f30f30c3-e166-44eb-bf8c-75dda3a84569.jpg"),
      gallery: [
        m("2991262/ffd3cd1d-cd8e-4689-97a8-253f17829825.jpg"),
        m("2991262/abd15936-bfca-4f0e-8ae3-129c51c5f7fb.jpg"),
        m("2991262/8777b3fc-af15-466a-82ab-2abbb0c664f6.jpg"),
        m("2991262/cc01e8f6-7e5b-4ff0-989c-cbfa329a223a.jpg"),
        m("2991262/7e3b208e-0f53-4e2d-8de5-4389da2480e8.jpg"),
        m("2991262/82123944-5902-48ea-9493-e6b137de28c6.jpg"),
        m("2991262/3c90d873-80ee-4ec7-b5fe-61ffeb4fd522.jpg"),
      ],
    },
    sourceUrl: src("apartament-2-camere-de-vanzare-pacii-bucuresti-cp2991262"),
  },

  {
    slug: "chiajna-stelelor-garsoniera",
    title: "Garsonieră pe Strada Stelelor",
    tagline: "Chiajna — bloc din 2023, stație STB în fața blocului",
    kind: "apartament",
    deal: "vanzare",
    segment: "rezidential",
    status: "vandut",
    neighborhood: "Chiajna",
    area: "Strada Stelelor, Chiajna",
    price: { amount: 43000, currency: "EUR" },
    specs: { surface: 29, rooms: 1, baths: 1, floor: "4 / 5", year: 2023 },
    story: [
      "Garsonieră pe Strada Stelelor nr. 9, Chiajna, la etajul 4 într-un imobil cu regim de înălțime P+5, construit în 2023.",
      "Se preda parțial mobilată, incluzând mobilierul de bucătărie și cel din baie. Suprafață utilă totală de 29 mp, din care 2 mp balcon. Ideală pentru o persoană singură sau un cuplu cu buget bine definit.",
    ],
    highlights: [
      "Bloc din 2023",
      "Decomandat, cu balcon",
      "Mobilier de bucătărie și baie incluse",
      "Mega Image la parter",
      "Comision 0% pentru cumpărător",
    ],
    nearby: [
      { label: "Stație STB", detail: "în fața blocului — liniile 483, 434" },
      { label: "Mega Image", detail: "la parter" },
      { label: "Militari Shopping Center", detail: "2 km, 5 minute cu mașina" },
    ],
    media: {
      cover: m("3029210/9372e256-0514-4afc-bf32-45f7b7b9751a.jpg"),
      gallery: [
        m("3029210/1baf4b33-8ef1-4dbd-a485-983acd7d5c9b.jpg"),
        m("3029210/c0652c7e-bb5f-4fa0-957d-9631cd7b6c5e.jpg"),
        m("3029210/34c35b55-c77b-4cdb-a601-ec50b1ddfc15.jpg"),
        m("3029210/37a24080-5632-4cba-ad1d-37c114ef54a7.jpg"),
        m("3029210/f39dc069-2896-407a-85b2-0fe97c911ce9.jpg"),
        m("3029210/f256ba77-7d15-4f64-a152-e8fe083dbc95.jpg"),
        m("3029210/39f673a5-a311-4a5e-b65d-044332578686.jpg"),
      ],
    },
    sourceUrl: src("apartament-o-camera-de-vanzare-chiajna-cp3029210"),
  },
];

export const getProperty = (slug: string) => properties.find((p) => p.slug === slug);

export const featuredProperties = () => properties.filter((p) => p.featured);

export const availableProperties = () =>
  properties.filter((p) => p.status === "disponibil" || p.status === "rezervat");

export const soldProperties = () =>
  properties.filter((p) => p.status === "vandut" || p.status === "inchiriat");

/** Toate zonele atinse vreodată — inclusiv cele unde nu mai e nimic de vânzare. */
export const neighborhoods = () =>
  [...new Set(properties.map((p) => p.neighborhood))].sort((a, b) => a.localeCompare(b, "ro"));

/**
 * Zonele unde chiar are ceva acum.
 *
 * ASTA se afișează public, nu `neighborhoods()`. Când au intrat tranzacțiile
 * încheiate, banda de pe home a început să promită 17 zone deși stocul acoperea
 * 11 — cinci dintre ele erau zone unde vânduse tot. O zonă anunțată fără nimic
 * în ea e o promisiune pe care n-o poți ține la telefon.
 */
export const availableNeighborhoods = () =>
  [...new Set(availableProperties().map((p) => p.neighborhood))].sort((a, b) =>
    a.localeCompare(b, "ro"),
  );

/**
 * Cifrele de pe home, calculate din portofoliul real.
 *
 * Sunt scoase din date intenționat: orice număr scris de mână („128 tranzacții”)
 * devine minciună în momentul în care se schimbă ceva și nimeni nu-și amintește
 * să-l actualizeze. Astea nu pot rămâne în urmă.
 */
export const portfolioStats = () => {
  const live = availableProperties();
  return [
    { value: String(live.length), label: "proprietăți în portofoliu, acum" },
    {
      value: String(live.filter((p) => p.segment === "comercial").length),
      label: "spații comerciale și industriale",
    },
    { value: String(availableNeighborhoods().length), label: "zone din București și Ilfov" },
    { value: "0%", label: "comision pentru cumpărător și chiriaș" },
  ];
};

const eur = new Intl.NumberFormat("ro-RO", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatPrice(price: Property["price"]): string {
  if (price.onRequest) return "Preț la cerere";
  const value = eur.format(price.amount);
  return price.period === "luna" ? `${value} / lună` : value;
}

/** Închirierile comerciale se cotează pe tot spațiul, nu pe mp — ca în anunțuri. */
export function priceLabel(property: Property): string {
  return formatPrice(property.price);
}

export const statusLabel: Record<Status, string> = {
  disponibil: "Disponibil",
  rezervat: "Rezervat",
  vandut: "Vândut",
  inchiriat: "Închiriat",
};

export const dealLabel: Record<Deal, string> = {
  vanzare: "De vânzare",
  inchiriere: "De închiriat",
};

export const segmentLabel: Record<Segment, string> = {
  rezidential: "Rezidențial",
  comercial: "Comercial",
};
