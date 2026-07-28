"use client";

import { Photo } from "./Photo";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { priceLabel, type Property } from "@/lib/properties";
import { HeroCanvas } from "./HeroCanvas";
import { Morph } from "./Morph";
import { morphName } from "@/lib/morph";

/**
 * Cât stă o fotografie pe ecran înainte să treacă la următoarea.
 * Dacă-l schimbi, schimbă și durata lui `.hero-zoom` din globals.css —
 * zoomul trebuie să acopere aproape tot intervalul, altfel se termină
 * devreme și ultima secundă pare înghețată.
 */
const INTERVAL = 4600;

/**
 * Cât trebuie să alunece degetul ca să conteze trecere, nu click ratat.
 * Sub ~40px, orice apăsare cu degetul mare pe ecran ar schimba fotografia.
 */
const SWIPE_MIN = 44;

interface HeroCinematicProps {
  properties: Property[];
}

/**
 * Banda cu ofertele: fotografia pe negru, legenda peste ea.
 *
 * Ideea de bază — pe un site de portofoliu imobiliar, primul ecran trebuie să
 * fie o proprietate, nu o pagină de text. Fotografiile se schimbă lent între
 * ele, cu un zoom aproape imperceptibil, iar legenda din colț arată tot timpul
 * ce se vede: cartier, titlu, preț. Adică hero-ul face deja treaba unui
 * portofoliu, nu doar decorează.
 *
 * A fost ecran plin. Acum e jumătate, cerut de Vlad. Nu e doar o înălțime
 * schimbată: la 46svh nu mai încape titlul mare de dinainte — patru rânduri de
 * literă de ~110px cer 400px, iar toată banda are 368px pe un ecran obișnuit.
 * Deci titlul a plecat, iar ce a rămas e chiar oferta. Vezi mai jos.
 *
 * Toate fotografiile stau în DOM de la început, suprapuse; se schimbă doar
 * opacitatea. Nu se demontează nimic, deci nu există flash de imagine
 * neîncărcată la fiecare rotație.
 */
export function HeroCinematic({ properties }: HeroCinematicProps) {
  /**
   * Memorate, nu recalculate: lista de căi ajunge la HeroCanvas ca dependență
   * de efect. Un tablou nou la fiecare randare ar reconstrui contextul WebGL
   * și ar reîncărca toate texturile la fiecare rotație, adică o dată la 4,6
   * secunde, la nesfârșit.
   */
  const slides = useMemo(() => properties.slice(0, 4), [properties]);
  const covers = useMemo(() => slides.map((property) => property.media.cover), [slides]);
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(false);
  /**
   * Crește la fiecare intervenție a omului și repornește ceasul rotației.
   * Fără el, dacă dai la fotografia următoare cu o jumătate de secundă înainte
   * să sune cronometrul, ea sare imediat mai departe — adică exact senzația că
   * nu tu conduci.
   */
  const [nudge, setNudge] = useState(0);

  /** Punctul de unde a început gestul curent, cât ține el. */
  const drag = useRef<{ x: number; y: number; id: number } | null>(null);

  const go = useCallback(
    (next: number) => {
      const count = slides.length;
      if (count < 2) return;
      setIndex(((next % count) + count) % count);
      setNudge((n) => n + 1);
    },
    [slides.length],
  );

  // Pornim rotația abia după montare și doar dacă omul n-a cerut mai puțină
  // mișcare. Fără JS sau cu reduced-motion rămâne prima fotografie, fixă —
  // hero-ul arată tot corect, doar că nu se mai rotește.
  useEffect(() => {
    if (slides.length < 2) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAuto(!reduced.matches);

    update();
    reduced.addEventListener("change", update);
    return () => reduced.removeEventListener("change", update);
  }, [slides.length]);

  useEffect(() => {
    if (!auto) return;

    const tick = () => setIndex((i) => (i + 1) % slides.length);
    let timer = window.setInterval(tick, INTERVAL);

    // În tabul din fundal nu are rost să rulăm: la revenire omul ar prinde
    // imaginile în mijlocul unui salt.
    const onVisibility = () => {
      window.clearInterval(timer);
      if (!document.hidden) timer = window.setInterval(tick, INTERVAL);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // `nudge` e aici dinadins: schimbarea lui reface intervalul de la zero.
  }, [auto, slides.length, nudge]);

  const current = slides[index];

  /**
   * Trecerea cu degetul.
   *
   * Ne uităm doar la punctul de plecare și la cel de sosire, nu urmărim
   * mișcarea: fotografia nu se trage sub deget, doar sare la următoarea. E
   * suficient pentru ce trebuie și nu se bate cu scroll-ul paginii.
   *
   * Două condiții ca să conteze un gest, și amândouă sunt necesare:
   * distanța minimă separă gestul de un click ratat, iar comparația cu
   * mișcarea pe verticală ne ține departe de scroll — cine derulează pagina cu
   * degetul peste hero n-are de ce să schimbe fotografia.
   */
  const onPointerDown = (event: React.PointerEvent) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    drag.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
  };

  const onPointerUp = (event: React.PointerEvent) => {
    const start = drag.current;
    drag.current = null;
    if (!start || start.id !== event.pointerId) return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(dy) * 1.2) return;

    go(index + (dx < 0 ? 1 : -1));
  };

  return (
    // `data-dark-hero` spune header-ului că trebuie să treacă pe alb cât e
    // deasupra fotografiei. Vezi SiteHeader.
    <section
      data-dark-hero
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (drag.current = null)}
      // Trasul cu mouse-ul peste o fotografie pornește altfel gestul nativ de
      // „ia imaginea și mut-o”, care se vede ca o fantomă a pozei lipită de
      // cursor și înghite gestul nostru.
      onDragStart={(event) => event.preventDefault()}
      // `select-none`: altfel trasul peste titlu selectează textul în loc să
      // treacă la fotografia următoare, iar omul rămâne cu o dâră albastră pe
      // ecran și cu senzația că site-ul s-a stricat.
      // Fără `-mt-20` de când deasupra stă banda de deschidere: marginea aia
      // negativă anula `pt-20` de pe `main`, ca hero-ul să treacă pe sub
      // header. Acum banda face asta, iar hero-ul e al doilea — cu ea, se urca
      // 80px peste bandă și îi acoperea sigla pe jumătate.
      //
      // 46svh: banda de deasupra are 50, deci cele două fac 96svh. Primul ecran
      // ține și fața lui, și prima ofertă, iar dedesubt rămâne o dungă de crem
      // care spune că pagina continuă. `min-h` acoperă ecranele scunde, unde
      // procentele n-ar lăsa loc de legendă.
      className="bg-void text-paper relative isolate h-[46svh] min-h-[19rem] w-full overflow-hidden select-none"
    >
      {/* --- Fotografiile suprapuse ---
          `.hero-open` e deschiderea: cadrul pornește puțin mai strâns și mai
          întunecat și se așază în 1,5s. Nu atinge opacitatea și nu maschează
          nimic, tocmai ca fotografia să rămână eligibilă pentru LCP — un
          preloader ar fi cumpărat aceeași senzație cu o secundă din timpul
          omului. Vezi globals.css. */}
      <div className="hero-open absolute inset-0">
        {slides.map((property, i) => (
          <div
            key={property.slug}
            aria-hidden={i !== index}
            className="absolute inset-0 transition-opacity duration-[1600ms] ease-out"
            style={{ opacity: i === index ? 1 : 0 }}
          >
            {/* Zoomul e animație CSS (`.hero-zoom`), nu tranziție: o tranziție
                are nevoie de o schimbare de valoare ca să pornească, iar prima
                fotografie se randează direct în starea finală — deci stătea
                nemișcată până la prima rotație. Vezi globals.css.
                Scara de repaus o scriem inline, nu cu `scale-*` din Tailwind:
                în v4 utilitarul setează proprietatea CSS `scale`, care ar
                rămâne peste `transform`-ul animației. */}
            <div
              // `relative` e doar ca `fill` să-și găsească reperul explicit:
              // `transform` creează oricum blocul de referință, dar next/image
              // se uită la `position` și altfel avertizează degeaba.
              className={`relative h-full w-full ${i === index ? "hero-zoom" : ""}`}
              style={{ transform: "scale(1.02)" }}
            >
              {/* Numele îl poartă doar fotografia de pe ecran acum. La click
                  pe legendă, ea rămâne pe loc și restul paginii se schimbă în
                  jurul ei — proprietatea nu „se încarcă”, se deschide. */}
              <Morph name={i === index ? morphName(property.slug) : undefined}>
                <Photo
                  src={property.media.cover}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  // Fără asta, trasul cu mouse-ul peste fotografie pornește
                  // mutarea nativă de imagine a browserului. Ea începe cu un
                  // `pointercancel`, care ne ștergea gestul din mână înainte
                  // să apuce să vină `pointerup` — de aia „nu mergea să tragi”
                  // în browser adevărat, deși mergea la test.
                  draggable={false}
                  className="object-cover"
                />
              </Morph>
            </div>
          </div>
        ))}

        {/* Peste teancul de fotografii, trecerea desenată pe GPU. Se aprinde
            singură când e gata; până atunci — și oriunde nu are ce rula — se
            vede fade-ul obișnuit de dedesubt. Vezi HeroCanvas. */}
        <HeroCanvas
          images={covers}
          index={index}
          interval={INTERVAL}
        />
      </div>

      <div className="scrim-hero pointer-events-none absolute inset-0" />

      {/* --- Conținut ---
          Aici era titlul mare al site-ului, „Apartamente în București și hale
          pe Centură”, iar legenda proprietății stătea sub el, mică, într-un
          colț. Două lucruri l-au scos:
          1. La jumătate de ecran nu mai încape — patru rânduri de literă de
             ~110px cer mai mult decât are toată banda.
          2. Vindea hale peste o fotografie de apartament. Vlad a cerut explicit
             ca prima pagină să fie doar rezidențial.
          Aceeași frază e oricum titlul secțiunii următoare, scrisă întreg, deci
          nu s-a pierdut nimic — doar nu se mai spune de două ori. Ce a rămas
          aici e chiar oferta: cartier, titlu, preț. */}
      <div className="shell relative flex h-full flex-col justify-end pt-20 pb-10 md:pb-12">
        <div
          className="border-paper/20 hero-in grid gap-5 border-t pt-5 md:grid-cols-12 md:items-end md:gap-8"
          style={{ "--in-delay": "560ms" } as CSSProperties}
        >
          {/* Legenda arată exact proprietatea care se vede acum. */}
          {current && (
            <div className="md:col-span-6">
              <Link href={`/proprietati/${current.slug}`} className="group block">
                <p className="eyebrow text-paper/55">{current.neighborhood}</p>
                <p className="font-display group-hover:text-bronze-soft mt-1.5 text-2xl transition-colors duration-500 md:text-3xl">
                  {current.title}
                </p>
                <p className="text-paper/70 nums mt-1 text-sm">{priceLabel(current)}</p>
              </Link>
            </div>
          )}

          {/* Butonul și săgețile pe același rând. Pe telefon, unul la un capăt
              și celelalte la altul; de la `md` în sus, amândouă strânse la
              dreapta, ca legenda să rămână singură în stânga. */}
          <div className="flex items-center justify-between gap-6 md:col-span-6 md:col-start-7 md:justify-end md:gap-10">
            <Link
              href="/proprietati"
              className="border-paper/40 text-paper btn-sweep hover:text-void inline-block border px-6 py-3.5 text-sm transition-colors duration-500 md:px-8 md:py-4"
            >
              Vezi portofoliul
            </Link>

            {/* Comenzile.
                Înainte erau doar barele-indicator: linii de 1px la 25%
                opacitate, în colț. Comanda exista — trăgeai cu degetul, iar
                săgețile de la tastatură mergeau — dar nimic nu spunea asta, iar
                săgețile cereau întâi focus pe o linie de un pixel. Adică o
                funcție pe care trebuia s-o ghicești. De aici butoane adevărate.

                Conturul are 36px, cerut mai mic, dar butonul are tot 44 —
                diferența e umplutură transparentă. Se vede o săgeată mică,
                se apasă o țintă cât degetul. */}
            {slides.length > 1 && (
              <div
                className="flex gap-1.5"
                onKeyDown={(event) => {
                  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                  event.preventDefault();
                  go(index + (event.key === "ArrowRight" ? 1 : -1));
                }}
              >
                {(
                  [
                    ["Fotografia precedentă", -1, "M15 18l-6-6 6-6"],
                    ["Fotografia următoare", 1, "M9 6l6 6-6 6"],
                  ] as const
                ).map(([label, step, path]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(index + step)}
                    aria-label={label}
                    className="group grid h-11 w-11 place-items-center"
                  >
                    <span className="border-paper/35 text-paper/70 group-hover:border-paper group-hover:text-paper grid h-9 w-9 place-items-center border transition-colors duration-300">
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="square"
                      >
                        <path d={path} />
                      </svg>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Cât mai stă fotografia pe ecran ---
          Barele erau lângă săgeți, într-un colț. La lățime de telefon, buton
          plus săgeți plus patru bare depășeau ecranul. Acum sunt o linie
          segmentată lipită de marginea de jos, pe toată lățimea: nu mai
          concurează pentru spațiu, se citesc dintr-o privire și rămân și
          comandă — un click pe un segment duce direct la fotografia lui.
          Semnalul de scroll de dinainte a plecat: la jumătate de ecran cădea
          exact peste rândul cu butonul, iar dunga de crem de sub bandă spune
          oricum că pagina continuă. */}
      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-0 z-10 flex">
          {slides.map((property, i) => (
            <button
              key={property.slug}
              type="button"
              onClick={() => go(i)}
              aria-label={`Vezi ${property.title}`}
              aria-current={i === index}
              className="flex-1 pt-5 pb-2"
            >
              <span className="bg-paper/25 mx-0.5 block h-0.5">
                <span
                  className="bg-paper block h-0.5 origin-left"
                  style={{
                    transform: `scaleX(${i === index ? 1 : 0})`,
                    transitionProperty: "transform",
                    transitionTimingFunction: "linear",
                    transitionDuration: i === index && auto ? `${INTERVAL}ms` : "400ms",
                  }}
                />
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
