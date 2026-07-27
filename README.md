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
| `npm run media` | aduce fotografiile de pe CDN-ul agenției și le redimensionează în `public/media/` |
| `npm run build` | export static în `out/` |
| `npm run lint` | eslint |

Fotografiile sunt commit-uite în repo (11 MB). `npm run media` sare peste ce
există deja; cu `--force` reface tot. Rulează-l după ce adaugi proprietăți noi
în `properties.ts`.

## Publicare

Se publică singur pe GitHub Pages la fiecare push pe `main`
(`.github/workflows/deploy.yml`). Workflow-ul rulează lint, apoi build cu
`NEXT_PUBLIC_BASE_PATH=/<nume-repo>`.

Trei lucruri care fac diferența dintre „merge local” și „merge pe Pages”:

- `output: "export"` — nu există server, deci nici Server Actions. De aceea
  formularul de contact deschide WhatsApp în loc să trimită un email.
- `images.unoptimized: true` — nu există optimizator. De aceea fotografiile
  sunt aduse și redimensionate din timp.
- **`next/image` nu adaugă `basePath` la `src` când e `unoptimized`.** Toate
  căile către `public/` trec prin `asset()` din `src/lib/asset.ts`. Dacă
  adaugi o imagine nouă și uiți, dă 404 pe Pages și merge perfect în local —
  cel mai enervant tip de bug.

## Structură

| Rută                  | Ce e                                                          |
| --------------------- | ------------------------------------------------------------- |
| `/`                   | Home condus de portofoliu, pentru cumpărători                  |
| `/proprietati`        | Grid cu filtre (tranzacție, tip, zonă) + arhiva tranzacțiilor  |
| `/proprietati/[slug]` | Pagina de proprietate — piesa de rezistență                    |
| `/despre`             | Povestea lui Vlad                                              |
| `/contact`            | Formular de lead + WhatsApp                                    |

Fișiere de care te atingi cel mai des:

- `src/lib/site.ts` — telefon, email, social, cifrele de track record
- `src/lib/properties.ts` — modelul de proprietate + portofoliul
- `src/app/globals.css` — tokenii de design (culori, tipografie, mișcare)

Piesele mari de compoziție:

| Componentă             | Ce face                                                        |
| ---------------------- | -------------------------------------------------------------- |
| `HeroCinematic`        | Ecran plin, fotografiile se rotesc lent, legenda arată ce vezi  |
| `HorizontalShowcase`   | Portofoliul se derulează lateral cât pagina merge în jos        |
| `PropertyIndexList`    | Index scanabil; la hover fotografia urmărește cursorul          |
| `PropertyStickyBar`    | Titlu, preț și buton, lipite sus pe pagina de proprietate       |
| `Marquee`              | Banda cu cartiere, curge continuu                               |
| `PropertyCard`         | Card numerotat, preț pe aceeași linie cu zona, bară la hover    |

## Date reale

Portofoliul, fotografiile, descrierile și datele de contact sunt **reale**,
preluate din listarea lui Vlad de pe site-ul agenției
(`trimbitasu-estate.ro/proprietati/?agent=5830`, citită în iulie 2026).

- **12 proprietăți** — 3 de vânzare, 9 de închiriat. Agenția afișează 15, dar
  trei sunt duplicate (vezi mai jos).
- **Fotografiile** vin de pe CDN-ul agenției (`media.crmrebs.com`), la
  rezoluția originală (4096×2304 la majoritate), nu miniaturi.
- **Textele din `story`** sunt descrierile scrise de Vlad, nu inventate.
- **Cifrele de pe home** se calculează din portofoliu (`portfolioStats()`),
  nu sunt scrise de mână. Un număr scris de mână devine minciună la prima
  schimbare pe care nimeni n-o mai actualizează.

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
4. **Nu există testimoniale și nici istoric de tranzacții.** Secțiunea de arhivă
   de pe home apare automat când există proprietăți cu status `vandut` sau
   `inchiriat`; până atunci e ascunsă. Testimonialele inventate au fost șterse.
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
