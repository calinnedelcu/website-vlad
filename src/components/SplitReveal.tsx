"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

interface SplitRevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Întârzierea primei linii, în ms. */
  delay?: number;
  /** Decalajul între linii, în ms. */
  stagger?: number;
  /**
   * Pentru titlurile de deasupra pliului: pornește imediat ce s-a făcut
   * împărțirea pe linii, fără să mai aștepte intrarea în ecran. Hero-ul nu are
   * ce aștepta — e deja pe ecran, iar întârzierea se vede ca o pagină goală.
   */
  immediate?: boolean;
}

/** Plasă de siguranță: dacă ceva nu merge, textul apare oricum după atâtea ms. */
const FAILSAFE_MS = 2500;

/**
 * Titlu care se ridică linie cu linie, din spatele unei măști.
 *
 * Textul se randează normal pe server (contează pentru SEO și pentru cazul în
 * care JS nu pornește), iar împărțirea pe linii se face în client, DUPĂ ce s-au
 * încărcat fonturile — altfel liniile s-ar măsura cu fontul de rezervă și
 * împărțirea ar fi greșită.
 *
 * `data-split-pending` ține titlul invizibil în intervalul dintre primul paint
 * și împărțire, dar numai când JS chiar rulează (vezi clasa `js` din layout și
 * regula din globals.css). Fără el s-ar vedea textul, apoi ar dispărea, apoi
 * s-ar reanima — mai urât decât dacă n-ar exista animația.
 *
 * Manipulăm DOM-ul direct pentru că titlurile sunt text static, fără stare;
 * dacă vreodată devin dinamice, componenta trebuie regândită.
 */
export function SplitReveal({
  children,
  as: Tag = "h2",
  className,
  delay = 0,
  stagger = 90,
  immediate = false,
}: SplitRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /** Scoate titlul din starea de așteptare. */
    const show = () => el.removeAttribute("data-split-pending");

    /**
     * Ultima linie de apărare: dacă ceva a mers prost după împărțire, liniile
     * ar rămâne translatate sub măști, adică text invizibil. Aici le forțăm
     * la loc, indiferent de starea observatorului.
     */
    const forceVisible = () => {
      show();
      if (el.hasAttribute("data-split")) el.setAttribute("data-split", "visible");
    };

    // Fără mișcare înseamnă fără mișcare: lăsăm textul exact cum e.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      show();
      return;
    }

    let cancelled = false;
    let observer: IntersectionObserver | undefined;
    const failsafe = window.setTimeout(forceVisible, FAILSAFE_MS);

    const split = async () => {
      try {
        await document.fonts.ready;
      } catch {
        /* fără suport pentru fonts.ready mergem mai departe cu ce avem */
      }
      if (cancelled) return;

      const text = el.textContent?.trim();
      if (!text) {
        show();
        return;
      }

      // 1. Fiecare cuvânt devine inline-block, ca să-i putem citi linia.
      el.textContent = "";
      const words = text.split(/\s+/).map((word) => {
        const span = document.createElement("span");
        span.textContent = word;
        span.style.display = "inline-block";
        el.append(span, document.createTextNode(" "));
        return span;
      });

      // 2. Grupăm cuvintele pe linii după poziția verticală.
      const lines: HTMLSpanElement[][] = [];
      let lastTop: number | null = null;
      for (const word of words) {
        const top = word.offsetTop;
        if (lastTop === null || Math.abs(top - lastTop) > 2) {
          lines.push([]);
          lastTop = top;
        }
        lines[lines.length - 1].push(word);
      }

      // 3. Reconstruim: fiecare linie primește o mască și un strat care urcă.
      el.textContent = "";
      lines.forEach((line, i) => {
        const mask = document.createElement("span");
        mask.className = "split-line";

        const inner = document.createElement("span");
        inner.className = "split-inner";
        inner.style.setProperty("--reveal-delay", `${delay + i * stagger}ms`);
        // Spațiul de la final ține cuvintele separate la copiere; fără el,
        // textul selectat ar ieși lipit: "dinBucurești".
        inner.textContent =
          line.map((w) => w.textContent).join(" ") + (i < lines.length - 1 ? " " : "");

        mask.append(inner);
        el.append(mask);
      });

      el.setAttribute("data-split", "hidden");
      show();

      // La fel ca la Reveal: dacă titlul e deja deasupra ecranului, îl arătăm
      // direct — altfel ar rămâne ascuns pentru totdeauna.
      if (immediate || el.getBoundingClientRect().bottom < 0) {
        // Citirea forțează browserul să calculeze layout-ul acum, deci starea
        // de start a tranziției e comisă înainte să schimbăm atributul.
        // Nu folosim requestAnimationFrame: în taburile din fundal e suspendat,
        // iar titlul ar rămâne blocat sub mască până revine omul la tab.
        void el.offsetHeight;
        el.setAttribute("data-split", "visible");
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            el.setAttribute("data-split", "visible");
            observer?.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: "0px 0px -5% 0px" },
      );
      observer.observe(el);
    };

    void split();

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [delay, stagger, immediate]);

  return (
    <Tag ref={ref} className={className} data-split-pending="">
      {children}
    </Tag>
  );
}
