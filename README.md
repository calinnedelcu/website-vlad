# Site Vlad Nedelcu — consultant imobiliar, București

Portofoliu personal, sub umbrela Trîmbițașu Estate. Direcție vizuală: **editorial
arhitectural, pe două registre** — deschideri cinematografice pe negru, unde
fotografia ocupă tot ecranul, alternate cu secțiuni de hârtie caldă unde se
citește. Tipografie serif mare, un singur accent bronz, grain de film peste tot.

Regula de compoziție: **niciun ecran de deschidere nu e doar text.** Pe un site
care trăiește din fotografii, prima imagine trebuie să fie o proprietate.

Next.js 16 (App Router) · React 19 · Tailwind v4 · TypeScript.

**Live:** <https://calinnedelcu.github.io/website-vlad/>

```bash
npm run dev
```

## Comenzi

| Comandă | Ce face |
| --- | --- |
| `npm run dev` | server local, fără prefix de cale |
| `npm run media` | aduce fotografiile, le redimensionează, generează miniaturile neclare și cardul de share |
| `npm run build` | export static în `out/` |
| `npm run lint` | eslint |

Fotografiile sunt commit-uite în repo (~15 MB). `npm run media` sare peste ce
există deja; cu `--force` reface tot. Rulează-l după ce adaugi proprietăți noi
în `properties.ts`.

Fotografii care nu vin de la agenție — portrete, orice dă Vlad direct — se pun
în `assets/` și ies în `public/media/local/` la aceeași comandă. Nimic de
configurat.

## Publicare

Se publică singur pe GitHub Pages la fiecare push pe `main`
(`.github/workflows/deploy.yml`). Workflow-ul rulează lint, apoi build cu
`NEXT_PUBLIC_BASE_PATH=/<nume-repo>`.

Trei lucruri care fac diferența dintre „merge local” și „merge pe Pages”:

- `output: "export"` — nu există server, deci nici Server Actions. De aceea
  formularul de contact deschide WhatsApp în loc să trimită un email.
- `images.unoptimized: true` — nu există optimizator. De aceea fotografiile
  sunt aduse și redimensionate din timp.
- **Prefixul se pune în două locuri, în sensuri opuse.** Ambele dau bug-uri
  care se văd doar pe deploy, niciodată în local:
  - `next/image` **nu** adaugă `basePath` la `src` când e `unoptimized`. Toate
    căile către `public/` trec prin `asset()` din `src/lib/asset.ts`. Uiți →
    404 pe Pages.
  - `metadataBase` **adaugă** el prefixul la căile din `openGraph.images`. Dacă
    îi dai o cale care îl are deja, iese `/repo/repo/og.jpg` și cardul de share
    rămâne gol. De aceea metadatele folosesc `unprefixed()`.

## Structură

| Rută                  | Ce e                                                          |
| --------------------- | ------------------------------------------------------------- |
| `/`                   | Home: sus ce e de vânzare acum, dedesubt ce s-a vândut deja    |
| `/proprietati`        | Doar ce e disponibil, cu filtre (tranzacție, tip, zonă)        |
| `/tranzactii`         | Doar ce s-a vândut, ca registru                                 |
| `/proprietati/[slug]` | Pagina de proprietate — piesa de rezistență                    |
| `/despre`             | Povestea lui Vlad                                              |
| `/contact`            | Formular de lead + WhatsApp                                    |

Activ și vândut sunt **pagini separate**, nu un comutator într-un filtru: sunt două
intenții diferite (cumpăr ceva / verific pe cine sun).

Fișiere de care te atingi cel mai des:

- `src/lib/site.ts` — telefon, email, social, cifrele de track record
- `src/lib/properties.ts` — modelul de proprietate + portofoliul
- `src/app/globals.css` — tokenii de design (culori, tipografie, mișcare)

Piesele mari de compoziție:

| Componentă             | Ce face                                                        |
| ---------------------- | -------------------------------------------------------------- |
| `HeroCinematic`        | Ecran plin, fotografiile se rotesc lent, legenda arată ce vezi  |
| `HorizontalShowcase`   | Portofoliul se derulează lateral cât pagina merge în jos        |
| `PropertyIndexList`    | Registrul de pe `/tranzactii`; la hover fotografia urmărește cursorul |
| `PropertyStickyBar`    | Titlu, preț și buton, lipite sus pe pagina de proprietate       |
| `PortfolioMap`         | Harta portofoliului: 17 zone, București plin / Ilfov gol        |
| `HeroCanvas`           | Trecerea dintre fotografiile din hero, desenată în WebGL        |
| `Morph`                | Fotografia trece dintr-o pagină în alta (View Transitions)      |
| `PropertyCard`         | Card numerotat, preț pe aceeași linie cu zona, bară la hover    |

## Date reale

Portofoliul, fotografiile, descrierile și datele de contact sunt **reale**,
preluate din listarea lui Vlad de pe site-ul agenției
(`trimbitasu-estate.ro/proprietati/?agent=5830`, citită în iulie 2026).

- **12 proprietăți active** — 3 de vânzare, 9 de închiriat. Agenția afișează 15,
  dar trei sunt duplicate (vezi mai jos).
- **8 tranzacții încheiate**, selecția dată de Vlad. Istoricul complet, filtrat
  pe el pe site-ul agenției, arăta **54 de rezultate** în iulie 2026 — linkul
  e pe home, sub arhivă (`site.transactionsUrl`).
- **Fotografiile** vin de pe CDN-ul agenției (`media.crmrebs.com`), la
  rezoluția originală (4096×2304 la majoritate), nu miniaturi.
- **Textele din `story`** sunt descrierile scrise de Vlad, nu inventate.
- **Cifrele se calculează din portofoliu** (`portfolioStats()`), nu sunt scrise
  de mână. Un număr scris de mână devine minciună la prima schimbare pe care
  nimeni n-o mai actualizează.
- **Zonele afișate public vin din `availableNeighborhoods()`, nu din
  `neighborhoods()`.** A doua le include și pe cele unde a vândut tot. Când au
  intrat tranzacțiile încheiate, banda de pe home a început să promită 17 zone
  deși stocul acoperea 11. O zonă anunțată fără nimic în ea e o promisiune pe
  care n-o poți ține la telefon.

### Ce am găsit greșit la datele agenției

Corectat în `properties.ts`, dar merită spus și lor:

1. **Două anunțuri din Roșu – Chiajna sunt etichetate „Militari”.** Descrierile
   spun clar „Strada Tineretului nr. 24, Roșu – Chiajna” și „Strada Ilie Petre
   8C, Roșu – Chiajna”.
2. **Trei duplicate.** Apartamentul din Tineretului apare de două ori (o dată ca
   Militari `cp3081123`, o dată ca Chiajna `cp3106703` — cu aceleași fotografii,
   din același folder). Cel din Crângași și cel din Grădina Icoanei apar fiecare
   de două ori, o dată ca apartament și o dată ca spațiu de birouri.
3. **Descrierea de la Asmita Gardens spune „4 camere”**, dar titlul și
   specificațiile spun 3.
4. **Anunțul `cp2991262` e intitulat „Pacii”**, dar descrierea spune Drumul
   Bacriului, Roșu – Chiajna. Aici e trecută zona din descriere.
5. **Anunțurile inactive nu-și mai arată fotografiile** — pagina de detaliu
   propune proprietăți similare în locul lor. Pozele tranzacțiilor încheiate
   sunt luate din `istoric-tranzactii/?agent=5830`, unde încă apar. Două dintre
   ele (`cp3117764`, `cp2861711`) au pozele în alt folder decât ID-ul propriu,
   pentru că sunt re-listări.

### Sincronizare automată

Agenția folosește **REBS CRM** (`crmrebs.com`) — de aceea vin pozele de pe
`media.crmrebs.com`. Asta răspunde la întrebarea „de unde vin datele”: nu e
nevoie de CMS și nici de introducere manuală a treia oară. De cerut agenției
acces la API-ul sau exportul REBS și `properties` devine un fetch. Tipurile din
`properties.ts` rămân la fel — de aceea sunt separate de date.

## De făcut înainte de lansare

**Blocante:**

1. **Acordul agenției pentru fotografii.** Fotografiile lor și portretul lui
   Vlad sunt acum copiate în `public/media/` și publicate pe un site public.
   De confirmat cu ei că e în regulă.
2. **Formularul de contact nu trimite email.** Deschide WhatsApp cu mesajul
   compus — funcționează, dar nu lasă urmă nicăieri. Când vrei lead-uri
   salvate: email (Resend/Postmark) + o bază unde nu se pierd. Validarea e deja
   separată, în `src/lib/lead.ts`; se schimbă doar `handleSubmit` din
   `LeadForm`. Atenție: un backend real înseamnă că nu mai poate rula pe
   GitHub Pages — atunci se mută pe Vercel (unde revine și optimizarea de
   imagini, deci `npm run media` devine opțional).
3. **Biografia lui Vlad lipsește.** `/despre` are acum un text construit strict
   din ce se vede în portofoliu. De când e în imobiliare, ce făcea înainte, de ce
   s-a dus pe industrial — numai el le știe. Vezi comentariul din
   `src/app/despre/page.tsx`.
4. **Nu există testimoniale.** Cele inventate au fost șterse. Istoricul de
   tranzacții există acum (8 bucăți); secțiunea de arhivă de pe home apare
   automat cât timp există proprietăți cu status `vandut` sau `inchiriat`.
5. **De completat în `src/lib/site.ts`:** adresa biroului și conturile de social
   media (acum sunt linkuri goale).

**Înainte de a da drumul public:**

- Acordul agenției pentru site personal (brand, logo, cui aparțin lead-urile)
- Domeniu + certificat
- Politică de confidențialitate și cookies (formularul colectează date personale)
- Google Business Profile legat de site
- Analytics

## Poziționare — de discutat cu Vlad

Prima versiune a site-ului a fost scrisă pe presupunerea că Vlad face lux în
nordul Bucureștiului. **Nu face.** Portofoliul real e: apartamente între 92.000
și 180.000 €, chirii între 500 și 3.250 €, în Cișmigiu, Floreasca, Crângași,
Grădina Icoanei, Roșu – Chiajna, Voluntari — plus hale industriale în Rudeni,
Vârteju și Măgurele.

Textele actuale sunt construite pe diferența care chiar există și pe care alți
agenți n-o au: **lucrează pe două piețe deodată, rezidențial în oraș și
industrial pe centură.** Patru din douăsprezece proprietăți sunt hale sau spații
comerciale — într-un moment în care A0 și parcurile logistice din jurul
Bucureștiului sunt exact zona care se mișcă.

Dacă Vlad vrea altă poziționare, se schimbă `tagline` și `intro` din
`src/lib/site.ts`, blocul de manifest și `steps` din `src/app/page.tsx`, și
`story` plus `values` din `src/app/despre/page.tsx`. Restul site-ului nu se
atinge.

## Ce nu e construit încă

Rămase din planul inițial, de făcut după ce intră conținutul real:

- Landing-uri separate `/servicii/vanzare`, `/servicii/inchirieri`, `/servicii/comercial`
- Pagini de cartier (`/cartiere/[slug]`) — motorul de SEO local
- `/evaluare` — magnetul de lead-uri pentru vânzători
- `/ghiduri` — acte, notar, taxe, Noua Casă
- Versiune EN (contează pentru comercial și zona de nord)
- Player video (Mux) și embed tur 3D — sloturile există deja în pagina de proprietate

## Ce NU e pe prima pagină, și de ce

Prima pagină a ajuns la un moment dat la 14 ecrane de derulat, cu 8 din 12
proprietăți afișate de două ori. Ce s-a tăiat, ca să nu se reintroducă din
reflex:

- **Indexul proprietăților active.** Dubla exact conținutul selecției de
  deasupra. Lista completă, cu filtre, e pe `/proprietati` — acolo îi e locul.
- **Selecția de proprietăți disponibile.** Rota aceleași proprietăți `featured`
  pe care le rotește hero-ul, la două ecrane distanță. Acum hero-ul ține ce e
  de vânzare acum, iar selecția orizontală ține ce s-a vândut deja — două
  lucruri diferite, fiecare cu rostul lui.
- **Blocul de patru cifre.** Era identic cu cel de pe `/despre`, iar trei din
  patru numere repetau ce se vedea în secțiunile vecine. Au rămas două cifre,
  în manifest.
- **Secțiunea „Două piețe”.** Spunea a doua oară ce spune manifestul, iar cele
  două carduri duceau amândouă la `/proprietati`, fără filtru — arătau ca o
  alegere, erau un singur link.
- **Arhiva ca opt carduri mari** a devenit listă. O tranzacție încheiată e
  dovadă, nu marfă: nimeni nu cumpără de acolo, deci fotografiile mari erau
  spațiu risipit.

Rezultat: 14,1 → 7,7 ecrane, 29 → 8 apariții de proprietăți, zero repetiții.

Apoi harta a înlocuit banda cu cartiere și a adus pagina la **8,9 ecrane**
(măsurat la 1440×900). E singura secțiune care a crescut pagina de la
curățenia aia încoace, și a fost o alegere: banda spunea același lucru ca harta
— „lucrez în zonele astea” — dar îl spunea ca decor. Dacă mai crește ceva,
crește în locul altcuiva.

**Regula, dacă adaugi ceva:** o proprietate apare o singură dată pe o pagină,
iar home-ul arată o selecție — nu tot portofoliul.

## Harta

Conturul e **geometrie reală**, adusă din OpenStreetMap:

```bash
npm run geo
```

`scripts/fetch-geo.mjs` cere Nominatim limita municipiului și cele șase
sectoare, le proiectează în kilometri, le simplifică (Ramer–Douglas–Peucker,
1340 → 137 de puncte pentru oraș) și le scrie în `src/lib/bucharest-shape.ts`.
Rezultatul e comis în repo — build-ul nu depinde de rețea. Se rulează rar:
granițele administrative nu se schimbă.

**Atribuirea OpenStreetMap de sub hartă e obligatorie (ODbL). Nu o scoate.**

`src/lib/geo.ts` ține coordonatele zonelor. Două lucruri de reținut:

- **Coordonatele zonelor sunt centre aproximative, nu adrese.** Arată în ce
  parte a orașului cade o proprietate, nu unde e. Restul site-ului promite
  același lucru („adresa exactă nu se publică niciodată”).
- **`county` NU e aproximativ.** E apartenența administrativă, și e ce afirmă
  harta categoric: punct plin = București, punct gol = Ilfov. Verificat
  împotriva poligonului real cu `isPointInFill` — toate cele 17 zone cad de
  partea pe care o declară.
- Dacă schimbi `BOUNDS` în `geo.ts`, **rulează `npm run geo` din nou**. Conturul
  e proiectat cu aceleași margini; altfel desenul și punctele nu mai cad în
  același loc.

### De ce nu e Centura pe hartă

A fost, desenată din memorie ca cerc de rază constantă (11,5 km). Punea
Măgurele, Vârteju și Chiajna *înăuntrul* orașului — pe dos față de realitate,
fix pe argumentul pentru care există secțiunea. Centura adevărată e un poligon
neregulat de ~72 km, cu raza între ~8,5 și ~13 km.

Am scos-o, dar atunci au rămas niște puncte plutind în negru: nici hartă, nici
informație. **Concluzia corectă n-a fost „scoate reperul”, ci „ia geometria
adevărată”** — de aici scriptul. Dacă vrei și Centura, ia traseul real din OSM
și desenează-l ca polilinie. Nu-l aproxima.

## Detaliile care fac diferența

Nu sunt funcționalități, sunt finisaje. Dacă le scoți, site-ul face exact
același lucru — doar că se simte ieftin.

- **Fotografiile urcă dintr-o miniatură neclară**, nu apar brusc. Miniaturile
  au 20px lățime, sunt generate la `npm run media` și intră direct în HTML
  (`src/lib/blur-data.ts`, ~13 KB gzip pentru tot site-ul). E cel mai vizibil
  detaliu de pe listă.
- **Cifre cu lățime egală** (`nums`) pe prețuri, suprafețe și numerele de
  index. Fără ele, prețurile din listă par prost aliniate, iar numărătoarea de
  pe home tresare din umeri la fiecare cadru.
- **Starea de focus e desenată** — inel bronz, iar pe secțiunile închise bronz
  deschis. Inelul albastru implicit ar rupe toată paleta.
- **Titlurile scurte nu rămân cu un cuvânt singur pe ultimul rând**
  (`text-wrap: balance`), iar textul curent nici atât (`pretty`).
- **`scroll-padding-top`** ca un link cu ancoră să nu aterizeze cu titlul sub
  header-ul fix.
- **Card de share** (`public/og.jpg`) — un agent își trimite linkurile pe
  WhatsApp de zeci de ori pe zi; fără el, linkul apare ca un rând gri.
- Bară de scroll în paletă, favicon propriu, fără dreptunghiul gri la atingere
  pe iOS, ligaturi și kerning pornite explicit.

## Note de implementare

**Regula de bază a animațiilor: se poate pierde o animație, niciodată conținutul.**
Fiecare componentă care ascunde ceva ca să-l anime are o plasă de siguranță pe
timer (`Reveal`, `SplitReveal`) și un caz special pentru elementele aflate deja
deasupra ecranului la montare (restaurare de scroll, linkuri cu ancoră). Dacă
modifici sistemul, păstrează proprietatea asta: pe un site care trăiește din
fotografii și titluri, un text rămas invizibil e o pagină goală.

Capcane deja plătite, de nu repetat:

- `src/components/Reveal.tsx` observă un container neafectat, iar masca
  (`clip-path`) stă pe copilul dinăuntru. Nu inversa: `clip-path` reduce la zero
  aria vizibilă a elementului, iar `IntersectionObserver` ține cont de asta —
  dacă observi chiar elementul mascat, nu intersectează niciodată.
- `src/components/SplitReveal.tsx` pornește tranziția după o citire de
  `offsetHeight`, nu prin `requestAnimationFrame`: rAF e suspendat în taburile
  din fundal, iar titlul ar rămâne blocat sub mască.
- Împărțirea pe linii se face doar după `document.fonts.ready`. Altfel liniile
  se măsoară cu fontul de rezervă și ies rupte aiurea.
- Ascunderea titlului până la împărțire se face prin `@media (scripting: enabled)`,
  nu printr-un script inline care pune o clasă pe `<html>` — varianta cu script
  producea o nepotrivire la hidratare.
- **Tailwind v4 pune `scale-*` și `translate-*` pe proprietățile CSS `scale` și
  `translate`, nu pe `transform`.** Deci `transition-transform` nu le animă.
  Unde conta, e scris explicit (inline sau ca `@utility` în globals.css).
- **Zoom-ul din hero e animație, nu tranziție.** O tranziție are nevoie de o
  schimbare de valoare ca să pornească, iar prima fotografie se randează direct
  în starea finală — stătea nemișcată până la prima rotație. Dacă vreodată pare
  că „nu se mișcă de la început”, aici e cauza.
- `HorizontalShowcase` își calculează înălțimea din lățimea reală a pistei, nu
  din `vh` ghicit. Cu `vh` fix, raportul dintre scroll și mișcare depindea de
  lățimea ecranului: pe monitor lat ieșeau trei ecrane de derulare pentru un
  ecran de mișcare. Aceeași măsurătoare se reafirmă la fiecare cadru, fiindcă
  React randează și el un `style` cu înălțimea de rezervă.
- Varianta prinsă (`sticky`) se activează doar în client, pe ecran lat și fără
  `prefers-reduced-motion`. Serverul randează întotdeauna caruselul obișnuit —
  fără nepotrivire la hidratare și fără conținut pierdut dacă JS nu pornește.

## Verificat / neverificat

**Verificat cu ochii, în browser:** hero-ul cinematic pe desktop și pe telefon,
capul de pagină de la `/proprietati`, `/despre` și `/contact`, pagina de
proprietate, secțiunea de manifest, banda cu cartiere, showcase-ul orizontal,
cifrele care se numără, testimonialele pe negru, arhiva, banda de închidere.
Împărțirea pe linii cu diacritice (fără cozi tăiate la ț/ș/ă). Header-ul care
trece pe alb peste fotografie și înapoi pe cerneală. Varianta de telefon a
showcase-ului (carusel cu snap, nu prins). Consolă curată pe încărcare
proaspătă, `lint` și `build` fără erori, toate cele 16 pagini statice.

Verificat și pe build-ul static, servit sub prefixul de pe Pages: toate rutele
și fotografiile dau 200, consolă curată, iar rotația hero-ului chiar pornește.

**Neverificat vizual: tot ce se declanșează din scroll sau hover** — parallax-ul,
translația din showcase-ul orizontal, tranziția între pagini, bara lipită de pe
pagina de proprietate, previzualizarea din index care urmărește cursorul.
Panoul de browser din mediul de dezvoltare raportează
`document.visibilityState === "hidden"`: `requestAnimationFrame` e suspendat,
capturile rămân pe un cadru vechi, iar React amână randările de prioritate
continuă (deci `setState` dintr-un handler de scroll nu se comite). Structura și
valorile de intrare sunt verificate în DOM — mișcarea propriu-zisă nu se poate
vedea de acolo. **De privit cu ochiul liber** pe site-ul publicat.
