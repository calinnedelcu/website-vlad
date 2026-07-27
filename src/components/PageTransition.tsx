"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Cortină care mătură ecranul la schimbarea de pagină.
 *
 * Se declanșează după ce conținutul nou e deja montat, deci nu întârzie
 * navigarea cu nimic — rolul ei e doar să lege cele două pagini vizual.
 * Prima încărcare nu primește cortină: nimeni nu vrea un preloader.
 */
export function PageTransition() {
  const pathname = usePathname();
  const curtainRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const curtain = curtainRef.current;
    if (!curtain) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const animation = curtain.animate(
      [
        { transform: "scaleY(1)", transformOrigin: "top" },
        { transform: "scaleY(0)", transformOrigin: "top" },
      ],
      { duration: 700, easing: "cubic-bezier(0.76, 0, 0.24, 1)", fill: "forwards" },
    );

    return () => animation.cancel();
  }, [pathname]);

  return (
    <div
      ref={curtainRef}
      aria-hidden="true"
      className="bg-forest pointer-events-none fixed inset-0 z-[90] origin-top scale-y-0"
    />
  );
}
