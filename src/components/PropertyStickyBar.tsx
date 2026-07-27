"use client";

import { useEffect, useState } from "react";
import { priceLabel, type Property } from "@/lib/properties";
import { site } from "@/lib/site";

/**
 * Bara care apare sub header după ce hero-ul proprietății a ieșit de pe ecran.
 *
 * Pagina de proprietate e lungă — galerie, descriere, specificații, vecinătate.
 * Undeva pe la jumătate, omul nu mai are pe ecran nici titlul, nici prețul,
 * nici un buton de contact. Bara le ține la îndemână fără să deranjeze.
 *
 * Doar pe desktop: pe telefon există deja bara de jos cu Sună / WhatsApp, iar
 * două bare simultan pe un ecran mic e o glumă proastă.
 */
export function PropertyStickyBar({ property }: { property: Property }) {
  const [visible, setVisible] = useState(false);
  const sold = property.status === "vandut" || property.status === "inchiriat";

  useEffect(() => {
    const check = () => {
      const hero = document.querySelector("[data-dark-hero]");
      // 5rem = înălțimea header-ului. Apare când hero-ul a trecut de el.
      setVisible(hero ? hero.getBoundingClientRect().bottom < 80 : window.scrollY > 600);
    };

    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  return (
    <div
      inert={!visible}
      className={`bg-paper/92 border-line fixed inset-x-0 top-20 z-40 hidden border-b backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:block ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
      }`}
    >
      <div className="shell flex h-14 items-center justify-between gap-6">
        <div className="flex min-w-0 items-baseline gap-4">
          <p className="truncate text-sm">{property.title}</p>
          <p className="text-muted shrink-0 text-sm">{property.neighborhood}</p>
        </div>

        <div className="flex shrink-0 items-center gap-6">
          <p className={`text-sm ${sold ? "text-muted line-through" : ""}`}>
            {priceLabel(property)}
          </p>
          <a
            href={site.contact.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="bg-ink text-paper px-5 py-2 text-sm transition-opacity duration-300 hover:opacity-85"
          >
            Programează o vizionare
          </a>
        </div>
      </div>
    </div>
  );
}
