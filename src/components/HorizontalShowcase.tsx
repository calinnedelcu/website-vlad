"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { priceLabel, type Property } from "@/lib/properties";

/**
 * Cât scroll vertical costă un pixel de mișcare orizontală. Sub 1 pare că
 * fuge de sub deget, mult peste 1 pare că s-a blocat pagina. 1.05 e aproape
 * de raportul unu-la-unu, dar lasă puțin timp la capete.
 */
const SCROLL_RATIO = 1.05;

/** Înălțime de pornire, până când măsurăm pista adevărată în client. */
const FALLBACK_VH = 45;

interface HorizontalShowcaseProps {
  properties: Property[];
  /** Titlul secțiunii, arătat vertical în stânga cât timp e prinsă. */
  eyebrow: string;
  title: string;
}

/**
 * Portofoliul care se derulează pe orizontală în timp ce pagina merge în jos.
 *
 * Secțiunea e înaltă, iar înăuntru stă un bloc `sticky` care rămâne prins pe
 * ecran; poziția verticală a scroll-ului se traduce în translație orizontală.
 * E cel mai bun mod de a arăta multe fotografii mari fără să faci pagina
 * infinită.
 *
 * Pe telefon și la `prefers-reduced-motion` nu prindem nimic: rândul devine un
 * carusel normal, cu scroll cu degetul și snap. Serverul randează exact
 * varianta asta, iar clientul o „promovează” la varianta prinsă doar dacă are
 * de ce — deci nu există nepotrivire la hidratare și nu se pierde conținut
 * dacă JS nu pornește.
 */
export function HorizontalShowcase({ properties, eyebrow, title }: HorizontalShowcaseProps) {
  const [pinned, setPinned] = useState(false);
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPinned(wide.matches && !reduced.matches);

    update();
    wide.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      wide.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const outer = outerRef.current;
    const track = trackRef.current;
    if (!pinned || !outer || !track) return;

    let frame = 0;
    let travel = 0;

    /**
     * Înălțimea secțiunii se calculează din lățimea reală a pistei, nu
     * ghicită în `vh`. Altfel raportul dintre scroll și mișcare depinde de
     * lățimea ecranului și de câte proprietăți sunt — pe un monitor lat
     * ieșea o secțiune de patru ecrane pentru o mișcare de un ecran.
     */
    const measure = () => {
      travel = Math.max(0, track.scrollWidth - window.innerWidth);
      applyHeight();
    };

    /**
     * Înălțimea o ținem în stilul inline, dar React randează și el un `style`
     * cu varianta de rezervă — orice re-randare ar șterge măsurătoarea. De
     * aceea o reafirmăm la fiecare cadru; e o comparație de șiruri, nu costă.
     */
    const applyHeight = () => {
      const wanted = `${window.innerHeight + travel * SCROLL_RATIO}px`;
      if (outer.style.height !== wanted) outer.style.height = wanted;
    };

    const apply = () => {
      frame = 0;
      applyHeight();
      const runway = outer.offsetHeight - window.innerHeight;
      if (travel <= 0 || runway <= 0) {
        track.style.transform = "";
        return;
      }
      const progress = Math.min(1, Math.max(0, -outer.getBoundingClientRect().top / runway));
      track.style.transform = `translate3d(${-progress * travel}px, 0, 0)`;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onResize = () => {
      measure();
      onScroll();
    };

    measure();
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      // Lăsăm pista și înălțimea curate: dacă se trece pe varianta neprinsă,
      // o translație rămasă din urmă ar ascunde jumătate din proprietăți.
      track.style.transform = "";
      outer.style.height = "";
    };
  }, [pinned]);

  const cards = properties.map((property, i) => (
    <ShowcaseCard key={property.slug} property={property} index={i} />
  ));

  return (
    <section
      ref={outerRef}
      className="bg-void text-paper relative"
      style={pinned ? { height: `calc(100vh + ${properties.length * FALLBACK_VH}vh)` } : undefined}
    >
      <div
        className={
          pinned ? "sticky top-0 flex h-screen flex-col justify-center overflow-hidden" : "py-20"
        }
      >
        <div className="shell flex items-end justify-between gap-8">
          <div>
            <p className="eyebrow text-paper/50">{eyebrow}</p>
            <h2 className="display-md mt-3 max-w-[16ch]">{title}</h2>
          </div>
          <p className="text-paper/40 hidden shrink-0 text-xs tracking-[0.18em] uppercase md:block">
            {pinned ? "Derulează" : "Trage lateral"} →
          </p>
        </div>

        {pinned ? (
          <div ref={trackRef} className="mt-12 flex gap-8 pl-[max(1.25rem,calc((100vw-90rem)/2+4rem))] pr-[20vw] will-change-transform">
            {cards}
          </div>
        ) : (
          <div className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 md:px-10">
            {cards}
          </div>
        )}
      </div>
    </section>
  );
}

function ShowcaseCard({ property, index }: { property: Property; index: number }) {
  return (
    <Link
      href={`/proprietati/${property.slug}`}
      className="group w-[78vw] shrink-0 snap-start sm:w-[52vw] md:w-[34vw] lg:w-[28vw]"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={property.media.cover}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 78vw, 34vw"
          className="media-zoom object-cover"
        />
        <div className="scrim-soft pointer-events-none absolute inset-0" />
        <div className="scrim-top pointer-events-none absolute inset-0" />
        <span className="text-paper absolute top-5 left-5 text-xs tracking-[0.2em]">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="absolute inset-x-5 bottom-5">
          <p className="eyebrow text-paper/70">{property.neighborhood}</p>
          <h3 className="font-display mt-1 text-2xl leading-tight">{property.title}</h3>
        </div>
      </div>
      <div className="border-void-line text-paper/60 mt-4 flex items-center justify-between border-t pt-3 text-sm">
        <span className="text-paper">{priceLabel(property)}</span>
        <span>{property.specs.surface} mp</span>
      </div>
    </Link>
  );
}
