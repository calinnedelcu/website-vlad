"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Etichetă rotundă care urmărește cursorul peste o imagine mare.
 *
 * Strict decorativă și strict pe desktop: apare doar unde există hover real,
 * ca să nu rămână blocată pe ecran la atingere. Poziția se scrie prin
 * `transform`, într-un singur rAF, ca să nu producă jank la mișcarea mouse-ului.
 */
export function HoverLabel({
  label,
  children,
  className,
}: {
  /** Textul din bulina care urmărește cursorul. */
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const zone = zoneRef.current;
    const dot = dotRef.current;
    if (!zone || !dot) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let x = 0;
    let y = 0;

    const render = () => {
      raf = 0;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };

    const onMove = (e: PointerEvent) => {
      const rect = zone.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
      if (!raf) raf = requestAnimationFrame(render);
    };

    const onEnter = () => dot.style.setProperty("opacity", "1");
    const onLeave = () => dot.style.setProperty("opacity", "0");

    zone.addEventListener("pointermove", onMove);
    zone.addEventListener("pointerenter", onEnter);
    zone.addEventListener("pointerleave", onLeave);

    return () => {
      zone.removeEventListener("pointermove", onMove);
      zone.removeEventListener("pointerenter", onEnter);
      zone.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={zoneRef} className={`relative ${className ?? ""}`}>
      <span
        ref={dotRef}
        aria-hidden="true"
        className="bg-paper text-ink pointer-events-none absolute top-0 left-0 z-10 flex h-28 w-28 items-center justify-center rounded-full px-4 text-center text-[0.6875rem] leading-tight font-medium tracking-[0.14em] uppercase opacity-0 transition-opacity duration-500"
      >
        {label}
      </span>
      {children}
    </div>
  );
}
