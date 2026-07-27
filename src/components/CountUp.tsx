"use client";

import { useEffect, useRef } from "react";

/**
 * Numără crescător când cifra intră în ecran.
 *
 * Valoarea completă e randată pe server și rămâne în DOM până pornește
 * animația, deci dacă JS nu se încarcă omul vede tot numărul, nu un zero.
 * Sufixele („97%") sunt păstrate ca atare.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const match = value.match(/^(\d+)(.*)$/);
    if (!match) return;

    const target = Number(match[1]);
    const suffix = match[2];
    let raf = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const duration = 1400;
        const start = performance.now();

        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          // easeOutExpo — pornește repede și se așază lin pe valoarea finală.
          const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          el.textContent = `${Math.round(eased * target)}${suffix}`;
          if (t < 1) raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    // `nums` e obligatoriu aici: fără cifre de lățime egală, numărul tresare
    // pe orizontală la fiecare cadru cât timp se numără.
    <p ref={ref} className={`nums ${className ?? ""}`}>
      {value}
    </p>
  );
}
