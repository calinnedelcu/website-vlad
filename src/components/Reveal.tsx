"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

type Variant = "default" | "image" | "line";

const attrFor: Record<Variant, string> = {
  default: "data-reveal",
  image: "data-reveal-image",
  line: "data-reveal-line",
};

/**
 * Plasă de siguranță: dacă observatorul nu s-a declanșat până atunci, arătăm
 * conținutul oricum. Regula e simplă — putem pierde o animație, niciodată un
 * text sau o fotografie. Orice eșec trebuie să lase pagina lizibilă.
 */
const FAILSAFE_MS = 3000;

interface RevealProps {
  children?: ReactNode;
  /** `image` folosește mască (clip-path), `line` scalează pe orizontală. */
  variant?: Variant;
  /** Întârziere în ms — pentru cascadă pe liste. */
  delay?: number;
  as?: ElementType;
  className?: string;
}

/**
 * Dezvăluire la scroll, o singură dată, prin IntersectionObserver.
 * Stilurile stau în globals.css, aici doar comutăm atributul —
 * așa animația e pur CSS și nu blochează thread-ul principal.
 *
 * ATENȚIE la structură: `clip-path` și `transform: scaleX(0)` reduc la zero
 * aria vizibilă a elementului, iar IntersectionObserver ține cont de asta —
 * dacă am observa chiar elementul mascat, n-ar intersecta niciodată și
 * animația n-ar porni. De aceea variantele `image` și `line` observă un
 * container neafectat, iar masca stă pe copilul dinăuntru.
 */
export function Reveal({
  children,
  variant = "default",
  delay = 0,
  as: Tag = "div",
  className,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const attr = attrFor[variant];

  useEffect(() => {
    const root = ref.current;
    const target = targetRef.current ?? root;
    if (!root || !target) return;

    const show = () => target.setAttribute(attr, "visible");

    // Dacă pagina s-a deschis deja derulată sub element (restaurare de scroll,
    // link cu ancoră), nu mai are ce să se dezvăluie: elementul e deasupra
    // ecranului și n-ar intra niciodată în raza observatorului.
    if (root.getBoundingClientRect().bottom < 0) {
      show();
      return;
    }

    const failsafe = window.setTimeout(show, FAILSAFE_MS);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          show();
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(root);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [attr]);

  const delayStyle = delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined;

  if (variant === "default") {
    return (
      <Tag ref={ref} className={className} style={delayStyle} data-reveal="hidden">
        {children}
      </Tag>
    );
  }

  return (
    <Tag ref={ref} className={className}>
      <div
        ref={targetRef}
        className="relative h-full w-full"
        style={delayStyle}
        {...{ [attr]: "hidden" }}
      >
        {children}
      </div>
    </Tag>
  );
}
