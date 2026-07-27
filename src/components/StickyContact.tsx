"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

/**
 * Bară de contact fixată jos, doar pe mobil.
 *
 * În România lumea sună sau dă mesaj pe WhatsApp; formularul e a doua opțiune.
 * Apare după ce omul a trecut de hero, ca să nu acopere prima impresie.
 */
export function StickyContact() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`border-line bg-paper/95 fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t backdrop-blur-md transition-transform duration-500 md:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      // Ascunsă din ordinea de tabulare cât timp e în afara ecranului.
      inert={!visible}
    >
      <a href={site.contact.phoneHref} className="border-line border-r py-4 text-center text-sm">
        Sună
      </a>
      <a
        href={site.contact.whatsapp}
        target="_blank"
        rel="noreferrer"
        className="bg-ink text-paper py-4 text-center text-sm"
      >
        WhatsApp
      </a>
    </div>
  );
}
