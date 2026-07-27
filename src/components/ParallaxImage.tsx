"use client";

import { Photo } from "./Photo";
import { useEffect, useRef } from "react";

interface ParallaxImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  /** Cât de mult "rămâne în urmă" imaginea, ca fracțiune din înălțimea ei. */
  amount?: number;
  className?: string;
  sizes?: string;
}

/**
 * Imagine full-bleed care se mișcă mai încet decât pagina.
 *
 * Imaginea e supradimensionată pe verticală și translatată — doar `transform`,
 * niciodată `top` sau `background-position`, ca să rămână pe compositor și să
 * nu declanșeze layout. Ascultătorul de scroll e pasiv, strâns cu rAF, și
 * calculează doar cât timp elementul e efectiv în ecran.
 */
export function ParallaxImage({
  src,
  alt,
  priority,
  amount = 0.12,
  className,
  sizes = "100vw",
}: ParallaxImageProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const inner = innerRef.current;
    if (!frame || !inner) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;
    let inView = false;

    const update = () => {
      ticking = false;
      const rect = frame.getBoundingClientRect();
      const viewport = window.innerHeight;

      // -1 când elementul tocmai iese pe sus, 1 când tocmai intră de jos.
      const progress = (rect.top + rect.height / 2 - viewport / 2) / (viewport / 2 + rect.height / 2);
      const shift = progress * amount * rect.height;
      inner.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      if (!inView || ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) update();
      },
      { rootMargin: "10% 0px" },
    );

    observer.observe(frame);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [amount]);

  return (
    <div ref={frameRef} className={`relative overflow-hidden ${className ?? ""}`}>
      {/* Stratul e mai înalt decât rama, ca translația să nu descopere marginile. */}
      <div
        ref={innerRef}
        className="absolute inset-x-0"
        style={{ top: `-${amount * 100}%`, bottom: `-${amount * 100}%` }}
      >
        <Photo src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
      </div>
    </div>
  );
}
