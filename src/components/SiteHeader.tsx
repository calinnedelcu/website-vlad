"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site } from "@/lib/site";
import { ScrollProgress } from "./ScrollProgress";

/**
 * Header minimal, cu două stări.
 *
 * Cât timp stă peste un hero închis la culoare (secțiunea marcată cu
 * `data-dark-hero`) rămâne transparent și scrie cu alb — fotografia nu are de
 * ce să fie tăiată de o bară. După ce trece de el se comportă normal: fundal
 * de hârtie, cerneală, linie jos.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [onDark, setOnDark] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const check = () => {
      setScrolled(window.scrollY > 24);
      const hero = document.querySelector("[data-dark-hero]");
      // 5rem = înălțimea header-ului. Cât timp hero-ul ajunge sub el, suntem
      // încă „pe fotografie”.
      setOnDark(!!hero && hero.getBoundingClientRect().bottom > 80);
    };

    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
    // Hero-ul închis există doar pe unele pagini, deci recalculăm la navigare.
  }, [pathname]);

  // Blochează scroll-ul în spatele meniului cât e deschis.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const light = onDark && !open;

  return (
    <header
      // Header-ul e singurul reper fix în timpul unei tranziții de pagină.
      // Dacă s-ar estompa și el odată cu restul, s-ar pierde senzația că doar
      // conținutul s-a schimbat. Numele îl scoate din instantaneul general;
      // regulile din globals.css îi opresc orice animație.
      style={{ viewTransitionName: "site-header" }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        light
          ? "text-paper border-b border-transparent"
          : scrolled || open
            ? "bg-paper/90 border-line text-ink border-b backdrop-blur-md"
            : "text-ink border-b border-transparent"
      }`}
    >
      <div className="shell flex h-20 items-center justify-between gap-6">
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-display text-xl tracking-tight">{site.name}</span>
          <span
            className={`eyebrow mt-1 text-[0.6rem] ${light ? "text-paper/60" : ""}`}
          >
            {site.agency}
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`link-underline text-sm transition-colors duration-300 ${
                  light
                    ? active
                      ? "text-bronze-soft"
                      : "text-paper/75 hover:text-paper"
                    : active
                      ? "text-bronze"
                      : "text-ink-soft hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <a
            href={site.contact.phoneHref}
            className={`btn-sweep border px-5 py-2.5 text-sm transition-colors duration-500 ${
              light
                ? "border-paper/40 text-paper hover:text-void"
                : "border-ink text-ink hover:text-paper"
            }`}
          >
            {site.contact.phone}
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="eyebrow md:hidden"
          style={{ color: "currentColor" }}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? "Închide" : "Meniu"}
        </button>
      </div>

      <ScrollProgress />

      {open && (
        <div id="mobile-nav" className="bg-paper text-ink h-[calc(100dvh-5rem)] md:hidden">
          <nav className="shell flex flex-col gap-2 pt-10">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="display-md border-line border-b py-5"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-8 flex flex-col gap-3">
              <a
                href={site.contact.phoneHref}
                className="bg-ink text-paper px-6 py-4 text-center text-sm"
              >
                Sună — {site.contact.phone}
              </a>
              <a
                href={site.contact.whatsapp}
                className="border-ink border px-6 py-4 text-center text-sm"
                target="_blank"
                rel="noreferrer"
              >
                Scrie pe WhatsApp
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
