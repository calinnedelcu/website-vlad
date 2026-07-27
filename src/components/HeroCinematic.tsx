"use client";

import { Photo } from "./Photo";
import Link from "next/link";
import { useEffect, useState } from "react";
import { priceLabel, type Property } from "@/lib/properties";
import { site } from "@/lib/site";

/**
 * Cât stă o fotografie pe ecran înainte să treacă la următoarea.
 * Dacă-l schimbi, schimbă și durata lui `.hero-zoom` din globals.css —
 * zoomul trebuie să acopere aproape tot intervalul, altfel se termină
 * devreme și ultima secundă pare înghețată.
 */
const INTERVAL = 4600;

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
  const slides = properties.slice(0, 4);
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(false);

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
  }, [auto, slides.length]);

  const current = slides[index];

  return (
    // `data-dark-hero` spune header-ului că trebuie să treacă pe alb cât e
    // deasupra fotografiei. Vezi SiteHeader.
    <section
      data-dark-hero
      className="bg-void text-paper relative isolate -mt-20 h-[100svh] min-h-[36rem] w-full overflow-hidden"
    >
      {/* --- Fotografiile suprapuse --- */}
      <div className="absolute inset-0">
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
              className={`h-full w-full ${i === index ? "hero-zoom" : ""}`}
              style={{ transform: "scale(1.02)" }}
            >
              <Photo
                src={property.media.cover}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="scrim-hero pointer-events-none absolute inset-0" />

      {/* --- Conținut --- */}
      <div className="shell relative flex h-full flex-col pt-28 pb-10 md:pb-14">
        <p className="eyebrow text-paper/55">
          {site.role} · {site.city}
        </p>

        <div className="mt-auto">
          <h1 className="display-hero max-w-[13ch]">{site.tagline}</h1>

          <div className="border-paper/20 mt-10 grid gap-8 border-t pt-6 md:grid-cols-12 md:items-end">
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

            {/* Indicatoare: fiecare bară se umple cât stă fotografia pe ecran. */}
            {slides.length > 1 && (
              <div className="flex gap-3 md:col-span-2 md:col-start-11 md:justify-end">
                {slides.map((property, i) => (
                  <button
                    key={property.slug}
                    type="button"
                    onClick={() => setIndex(i)}
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
      <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden justify-center md:flex">
        <span className="bg-paper/50 scroll-cue block h-16 w-px" />
      </div>
    </section>
  );
}
