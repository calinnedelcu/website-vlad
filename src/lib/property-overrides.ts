import type { Deal, PropertyKind, Segment, Status } from "./properties";

/**
 * Stratul scris de mână. Sincronizarea nu-l atinge niciodată.
 *
 * `properties.generated.json` vine din CRM-ul agenției și se rescrie singur în
 * fiecare zi: preț, suprafață, camere, an, fotografii, descriere. Fișierul
 * ăsta ține ce nu poate veni de acolo — și e singurul pe care îl editezi.
 *
 * Cheia e id-ul proprietății din CRM, cel din coada adresei anunțului:
 * `.../apartament-4-camere-de-vanzare-cismigiu-bucuresti-cp3237398/` → 3237398.
 * E stabil: nu se schimbă când Vlad modifică prețul sau textul.
 *
 * DE CE EXISTĂ FIECARE CÂMP DE AICI
 *
 * - `slug` — adresa de pe site-ul nostru. A lor conține cuvinte-cheie pentru
 *   Google („apartament-4-camere-de-vanzare-cismigiu-bucuresti-cp3237398”).
 *   Trebuie să rămână fixă chiar dacă anunțul se redenumește, altfel se rup
 *   linkurile trimise pe WhatsApp.
 * - `title`, `tagline` — titlurile din CRM sunt scrise pentru portaluri:
 *   „CISMIGIU - Cobalcescu 4 Camere 85 mp Renovat 1/3”. Aici scriem omenește.
 * - `neighborhood` — fluxul dă „Bucuresti” la zece din douăsprezece anunțuri,
 *   și fără diacritice („Varteju”, „Magurele”). Cișmigiu, Grădina Icoanei sau
 *   Roșu – Chiajna nu apar nicăieri. Harta se desenează din câmpul ăsta.
 * - `status` — se scrie DOAR când proprietatea nu mai e disponibilă, și doar
 *   după ce confirmă Vlad. Când un anunț dispare din listare, sincronizarea îl
 *   marchează `listed: false` și te întreabă; nu scrie singură „vândut”,
 *   fiindcă dispariția poate însemna la fel de bine „retras de pe piață”.
 * - `specs` — etaj, teren, parcare. Fluxul n-are câmpuri pentru ele.
 * - `highlights`, `nearby` — citite din descriere de un om. Nimic inventat:
 *   dacă o distanță nu scrie în anunț, nu se trece. Vezi README.
 * - `kind`, `segment`, `deal` — doar ca portiță. Scriptul le deduce din adresa
 *   anunțului și a nimerit toate cele 20 la migrare, deci de obicei stau goale.
 *
 * CE SE ÎNTÂMPLĂ CU UN ANUNȚ NOU
 *
 * Apare pe site singur, cu titlul și descrierea din CRM. Arată corect, doar că
 * n-are încă haine bune. Îi adaugi un rând aici când ai chef — site-ul nu
 * așteaptă după tine.
 */
export interface PropertyOverride {
  slug: string;
  title?: string;
  tagline?: string;
  neighborhood?: string;
  area?: string;
  status?: Status;
  kind?: PropertyKind;
  segment?: Segment;
  deal?: Deal;
  specs?: { floor?: string; land?: number; parking?: number };
  highlights?: string[];
  nearby?: { label: string; detail: string }[];
  featured?: boolean;
  exclusive?: boolean;
  soldNote?: string;
}

/** Cheie: id-ul din CRM. Vezi mai sus de unde îl iei. */
export const overrides: Record<string, PropertyOverride> = {

  3081123: {
    slug: "tineretului-24-rosu-chiajna",
    title: "Trei camere pe Tineretului 24",
    tagline: "Roșu – Chiajna — bloc din 2016, mobilat și utilat complet",
    neighborhood: "Roșu – Chiajna",
    area: "Strada Tineretului, Roșu – Chiajna",
    specs: {floor: "7 / 8"},
    exclusive: true,
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
  },

  3123651: {
    slug: "gradina-icoanei-dumbrava-rosie",
    title: "Trei camere pe Dumbrava Roșie",
    tagline: "Grădina Icoanei — nemobilat, pretabil birou sau locuit",
    neighborhood: "Grădina Icoanei",
    area: "Strada Dumbrava Roșie, Sector 2",
    specs: {floor: "2 / 2"},
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
  },

  3131961: {
    slug: "hala-rudeni-centura",
    title: "Hală și birouri în parc industrial, Rudeni",
    tagline: "Chiajna — acces direct din Centură, 450 mp producție + 120 mp birouri",
    neighborhood: "Rudeni",
    area: "Chiajna — Rudeni, acces din Șoseaua de Centură",
    specs: {land: 982},
    featured: true,
    exclusive: true,
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
  },

  3163181: {
    slug: "hala-varteju-a0",
    title: "Hală la cheie, Vârteju",
    tagline: "Ilfov — 1 km de Centură, 4 km de A0",
    neighborhood: "Vârteju",
    area: "Vârteju, Ilfov — acces din Șoseaua de Centură",
    specs: {land: 1000},
    featured: true,
    exclusive: true,
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
  },

  3193617: {
    slug: "crangasi-saidac-4-camere",
    title: "Patru camere pe Saidac",
    tagline: "Crângași — nemobilat, pretabil birou sau locuit",
    neighborhood: "Crângași",
    area: "Strada Locotenent Gheorghe Saidac, Sector 6",
    specs: {floor: "3 / 4"},
    exclusive: true,
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
  },

  3199302: {
    slug: "floreasca-ceaikovski-2-camere",
    title: "Două camere pe Ceaikovski",
    tagline: "Floreasca — renovat, bloc reabilitat, stație în fața scării",
    neighborhood: "Floreasca",
    area: "Strada Ceaikovski, Sector 1",
    specs: {floor: "1 / 3"},
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
  },

  3233945: {
    slug: "voluntari-craiovei-2-camere",
    title: "Două camere în bloc din 2025, Voluntari",
    tagline: "Complet mobilat și utilat, la parter",
    neighborhood: "Voluntari",
    area: "Strada Craiovei, Voluntari",
    specs: {floor: "parter / 1"},
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
  },

  3234223: {
    slug: "spatiu-comercial-calea-vacaresti",
    title: "Spațiu comercial stradal, Calea Văcărești",
    tagline: "200 mp cu vitrină de 8 metri și trafic pietonal intens",
    neighborhood: "Văcărești",
    area: "Calea Văcărești, Sector 4",
    specs: {floor: "parter"},
    featured: true,
    exclusive: true,
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
  },

  3237398: {
    slug: "cismigiu-cobalcescu-4-camere",
    title: "Patru camere pe Cobălcescu",
    tagline: "Cișmigiu — bloc din 1930, renovat integral în 2020",
    neighborhood: "Cișmigiu",
    area: "Grigore Cobălcescu, Sector 1",
    specs: {floor: "1 / 3"},
    featured: true,
    exclusive: true,
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
  },

  3244787: {
    slug: "cort-industrial-magurele",
    title: "Cort industrial cu teren, Măgurele",
    tagline: "300 mp acoperiți pe 900 mp de teren, acces TIR",
    neighborhood: "Măgurele",
    area: "Măgurele, Ilfov",
    specs: {land: 900},
    exclusive: true,
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
  },

  3246242: {
    slug: "asmita-gardens-3-camere",
    title: "Trei camere în Asmita Gardens",
    tagline: "Splaiul Unirii — 105 mp, la 8 minute de metroul Mihai Bravu",
    neighborhood: "Mihai Bravu",
    area: "Splaiul Unirii — complexul Asmita Gardens",
    specs: {floor: "2 / 15"},
    featured: true,
    exclusive: true,
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
  },

  3257960: {
    slug: "militari-residence-ilie-petre",
    title: "Trei camere în bloc nou, Ilie Petre",
    tagline: "Roșu – Chiajna — construcție 2024, etaj intermediar",
    neighborhood: "Roșu – Chiajna",
    area: "Strada Ilie Petre, Militari Residence",
    specs: {floor: "4 / 5"},
    exclusive: true,
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
  },

  2805124: {
    slug: "dobroesti-platanii-3-camere",
    title: "Trei camere în Platanii Residence",
    tagline: "Dobroești — 89 mp total, cu loc de parcare",
    neighborhood: "Dobroești",
    area: "Strada Stejarului, complexul Platanii Residence",
    status: "vandut",
    specs: {floor: "2 / 4",parking: 1},
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
  },

  2861201: {
    slug: "drumul-taberei-prelungirea-ghencea",
    title: "Două camere pe Prelungirea Ghencea",
    tagline: "Drumul Taberei — retras de bulevard, gata de mutare",
    neighborhood: "Drumul Taberei",
    area: "Strada Prelungirea Ghencea, Sector 6",
    status: "vandut",
    specs: {floor: "parter / 10"},
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
  },

  2861711: {
    slug: "drumul-taberei-cetatea-histriei",
    title: "Trei camere pe Cetatea Histriei",
    tagline: "Drumul Taberei — bloc reabilitat termic, logie de 4 mp",
    neighborhood: "Drumul Taberei",
    area: "Strada Cetatea Histriei, Sector 6",
    status: "vandut",
    specs: {floor: "3 / 4"},
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
  },

  2926910: {
    slug: "gorjului-3-camere-rasaritului",
    title: "Trei camere la cinci minute de metrou",
    tagline: "Gorjului — două balcoane, instalații schimbate",
    neighborhood: "Gorjului",
    area: "Strada Răsăritului, Sector 6",
    status: "vandut",
    specs: {floor: "5 / 10"},
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
  },

  2991262: {
    slug: "rosu-chiajna-bacriului-2-camere",
    title: "Două camere pe Drumul Bacriului",
    tagline: "Roșu – Chiajna — decomandat, bloc din 2010",
    neighborhood: "Roșu – Chiajna",
    area: "Drumul Bacriului, Roșu – Chiajna",
    status: "vandut",
    specs: {floor: "demisol / 3"},
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
  },

  3006898: {
    slug: "plaza-4-camere-timisoara",
    title: "Patru camere vizavi de Plaza",
    tagline: "Bd. Timișoara — renovat complet, mobilat și utilat",
    neighborhood: "Bd. Timișoara",
    area: "Aleea Dumbrăvița, lângă Plaza România",
    status: "vandut",
    specs: {floor: "6 / 10"},
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
  },

  3029210: {
    slug: "chiajna-stelelor-garsoniera",
    title: "Garsonieră pe Strada Stelelor",
    tagline: "Chiajna — bloc din 2023, stație STB în fața blocului",
    neighborhood: "Chiajna",
    area: "Strada Stelelor, Chiajna",
    status: "vandut",
    specs: {floor: "4 / 5"},
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
  },

  3117764: {
    slug: "pacii-garsoniera-belsugului",
    title: "Garsonieră în bloc din 2020",
    tagline: "Păcii — mobilată și utilată, Lidl în fața blocului",
    neighborhood: "Păcii",
    area: "Drumul Belșugului, Sector 6",
    status: "vandut",
    specs: {floor: "parter / 10"},
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
  },
};

/**
 * Ordinea de afișare pe site. Nu e alfabetică și nici după preț — e aleasă de
 * om: ce vrea Vlad să vadă lumea întâi. Muți un id mai sus, se mută și pe site.
 *
 * Ce nu e trecut aici — adică anunțurile noi, apărute între timp din CRM — vine
 * după, cel mai nou întâi. Deci un anunț nou apare pe site fără să aștepte o
 * decizie; îi dai locul lui când te uiți peste el.
 */
export const order: string[] = [
  "3237398",
  "3131961",
  "3246242",
  "3163181",
  "3234223",
  "3244787",
  "3081123",
  "3257960",
  "3123651",
  "3193617",
  "3199302",
  "3233945",
  "3006898",
  "2805124",
  "2926910",
  "2861711",
  "3117764",
  "2861201",
  "2991262",
  "3029210",
];
