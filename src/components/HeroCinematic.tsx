"use client";

import { Photo } from "./Photo";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { priceLabel, type Property } from "@/lib/properties";
import { HeroCanvas } from "./HeroCanvas";
import { Morph } from "./Morph";
import { morphName } from "@/lib/morph";
import { SplitReveal } from "./SplitReveal";
import { site } from "@/lib/site";

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
 * Deschiderea site-ului: ecran plin, fotografia pe negru, titlul peste ea.
 *
 * Ideea de bază — pe un site de portofoliu imobiliar, primul ecran trebuie să
 * fie o proprietate, nu o pagină de text. Fotografiile se schimbă lent între
 * ele, cu un zoom aproape imperceptibil, iar legenda din colț arată tot timpul
 * ce se vede: cartier, titlu, preț. Adică hero-ul face deja treaba unui
 * portofoliu, nu doar decorează.
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
      // Fără `-mt-20` de când deasupra stă banda de deschidere: marginea aia
      // negativă anula `pt-20` de pe `main`, ca hero-ul să treacă pe sub
      // header. Acum banda face asta, iar hero-ul e al doilea — cu ea, se urca
      // 80px peste bandă și îi acoperea sigla pe jumătate.
      className="bg-void text-paper relative isolate h-[100svh] min-h-[36rem] w-full overflow-hidden"
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
          Ordinea intrării e regie, nu decor: mai întâi cine ești, apoi ce
          vinzi, la final ce poți face. Fiecare element intră după ce ochiul
          l-a terminat pe cel dinainte. Vezi `.hero-in` din globals.css. */}
      <div className="shell relative flex h-full flex-col pt-28 pb-10 md:pb-14">
        {/* Aici era „Agent imobiliar · București”. A plecat când prima pagină a
            primit banda de deschidere: aceeași etichetă apărea de două ori pe
            același ecran, la câteva sute de pixeli distanță. Cine e și unde
            lucrează se spune o dată, sus. */}
        <div className="mt-auto">
          <SplitReveal as="h1" className="display-hero max-w-[13ch]" immediate delay={620} stagger={110}>
            {site.tagline}
          </SplitReveal>

          <div
            className="border-paper/20 hero-in mt-10 grid gap-8 border-t pt-6 md:grid-cols-12 md:items-end"
            style={{ "--in-delay": "1080ms" } as CSSProperties}
          >
            <div className="md:col-span-4">
              <Link
                href="/proprietati"
                className="border-paper/40 text-paper btn-sweep hover:text-void inline-block border px-8 py-4 text-sm transition-colors duration-500"
              >
                Vezi portofoliul
              </Link>
            </div>

            {/* Legenda arată exact proprietatea care se vede acum. */}
            {current && (
              <div className="md:col-span-5 md:col-start-6">
                <Link href={`/proprietati/${current.slug}`} className="group block">
                  <p className="eyebrow text-paper/55">{current.neighborhood}</p>
                  <p className="font-display group-hover:text-bronze-soft mt-1.5 text-2xl transition-colors duration-500">
                    {current.title}
                  </p>
                  <p className="text-paper/70 nums mt-1 text-sm">{priceLabel(current)}</p>
                </Link>
              </div>
            )}

            {/* Indicatoare: fiecare bară se umple cât stă fotografia pe ecran.
                Sunt și comanda manuală de la tastatură — săgeți stânga/dreapta
                cât timp una dintre ele are focus. */}
            {slides.length > 1 && (
              <div
                className="flex gap-3 md:col-span-2 md:col-start-11 md:justify-end"
                onKeyDown={(event) => {
                  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                  event.preventDefault();
                  go(index + (event.key === "ArrowRight" ? 1 : -1));
                }}
              >
                {slides.map((property, i) => (
                  <button
                    key={property.slug}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Vezi ${property.title}`}
                    aria-current={i === index}
                    className="group w-10 py-3 md:w-8"
                  >
                    <span className="bg-paper/25 block h-px w-full origin-left">
                      <span
                        className="bg-paper block h-px origin-left"
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
          </div>
        </div>
      </div>

      {/* --- Semnalul de scroll --- */}
      <div
        className="hero-in pointer-events-none absolute inset-x-0 bottom-0 hidden justify-center md:flex"
        style={{ "--in-delay": "1400ms" } as CSSProperties}
      >
        <span className="bg-paper/50 scroll-cue block h-16 w-px" />
      </div>
    </section>
  );
}
