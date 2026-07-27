"use client";

import { Photo } from "./Photo";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { dealLabel, priceLabel, statusLabel, type Property } from "@/lib/properties";

interface PropertyIndexListProps {
  properties: Property[];
  eyebrow: string;
  title: string;
  /** Linkul din dreapta titlului. Extern dacă începe cu http. */
  linkHref: string;
  linkLabel: string;
  /** Rând mic sub titlu — context, nu decor. */
  note?: string;
}

/** Cât de repede ajunge previzualizarea din urmă cursorul. Sub 0.1 pare leneș. */
const EASE = 0.15;

/**
 * Indexul portofoliului: o listă scanabilă de proprietăți, iar la hover apare
 * fotografia și urmărește cursorul cu o mică întârziere.
 *
 * E perechea listei orizontale de mai sus: acolo te uiți, aici cauți. Cine știe
 * ce vrea citește douăsprezece rânduri în cinci secunde, fără să deruleze prin
 * douăsprezece fotografii mari.
 *
 * Toate fotografiile stau în DOM de la început, suprapuse, și se schimbă doar
 * opacitatea — altfel s-ar vedea o clipire la fiecare rând.
 *
 * Pe touch și la `prefers-reduced-motion` previzualizarea nu se montează deloc:
 * rămâne o listă obișnuită, care e oricum lucrul important.
 */
export function PropertyIndexList({
  properties,
  eyebrow,
  title,
  linkHref,
  linkLabel,
  note,
}: PropertyIndexListProps) {
  const [active, setActive] = useState<number | null>(null);
  const [enabled, setEnabled] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  /** x/y = poziția desenată, tx/ty = poziția cursorului. */
  const pos = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const frame = useRef(0);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(fine.matches && !reduced.matches);

    update();
    fine.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!enabled || !list) return;

    const draw = () => {
      frame.current = 0;
      const preview = previewRef.current;
      if (!preview) return;

      const p = pos.current;
      p.x += (p.tx - p.x) * EASE;
      p.y += (p.ty - p.y) * EASE;
      preview.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;

      // Ne oprim când am ajuns; nu ținem un rAF pornit degeaba.
      if (Math.abs(p.tx - p.x) > 0.4 || Math.abs(p.ty - p.y) > 0.4) {
        frame.current = requestAnimationFrame(draw);
      }
    };

    const onMove = (event: PointerEvent) => {
      pos.current.tx = event.clientX;
      pos.current.ty = event.clientY;
      if (!frame.current) frame.current = requestAnimationFrame(draw);
    };

    // La intrare sărim direct pe cursor, altfel fotografia ar veni zburând
    // din colțul din stânga sus.
    const onEnter = (event: PointerEvent) => {
      const p = pos.current;
      p.x = p.tx = event.clientX;
      p.y = p.ty = event.clientY;
      if (!frame.current) frame.current = requestAnimationFrame(draw);
    };

    list.addEventListener("pointerenter", onEnter);
    list.addEventListener("pointermove", onMove);
    return () => {
      list.removeEventListener("pointerenter", onEnter);
      list.removeEventListener("pointermove", onMove);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [enabled]);

  return (
    <section className="bg-void text-paper py-24 md:py-32">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-paper/50">{eyebrow}</p>
            <h2 className="display-md mt-3">{title}</h2>
            {note && <p className="text-paper/50 mt-4 max-w-[46ch] text-sm">{note}</p>}
          </div>
          {linkHref.startsWith("http") ? (
            <a
              href={linkHref}
              target="_blank"
              rel="noreferrer"
              className="link-underline text-paper/70 text-sm"
            >
              {linkLabel}
            </a>
          ) : (
            <Link href={linkHref} className="link-underline text-paper/70 text-sm">
              {linkLabel}
            </Link>
          )}
        </div>

        <div
          ref={listRef}
          onPointerLeave={() => setActive(null)}
          className="border-void-line mt-14 border-b"
        >
          {properties.map((property, i) => {
            // Aceeași listă servește și portofoliul curent, și arhiva. La o
            // tranzacție încheiată nu mai are sens „De vânzare”, iar prețul e
            // istorie — se taie, exact ca pe card.
            const done = property.status === "vandut" || property.status === "inchiriat";

            return (
              <Link
                key={property.slug}
                href={`/proprietati/${property.slug}`}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className={`group border-void-line block border-t py-6 transition-opacity duration-500 md:py-8 ${
                  active !== null && active !== i ? "opacity-35" : "opacity-100"
                }`}
              >
                <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                  <span className="eyebrow nums text-paper/40 w-8 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <h3 className="index-row font-display flex-1 text-[1.75rem] leading-tight md:text-[2.75rem]">
                    {property.title}
                  </h3>

                  <span className="text-paper/45 hidden shrink-0 text-sm md:block">
                    {property.neighborhood}
                  </span>
                  <span className="text-paper/45 hidden shrink-0 text-sm lg:block">
                    {done ? statusLabel[property.status] : dealLabel[property.deal]}
                  </span>
                  <span
                    className={`nums w-full shrink-0 text-sm md:w-44 md:text-right ${
                      done ? "text-paper/40 line-through" : ""
                    }`}
                  >
                    {priceLabel(property)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Previzualizarea care urmărește cursorul. Nu prinde clickuri și nu e
          citită de cititoarele de ecran — e pură decorație peste o listă care
          funcționează și fără ea. */}
      {enabled && (
        <div
          ref={previewRef}
          aria-hidden
          className={`pointer-events-none fixed top-0 left-0 z-40 hidden aspect-3/4 w-72 transition-opacity duration-500 md:block ${
            active === null ? "opacity-0" : "opacity-100"
          }`}
        >
          {properties.map((property, i) => (
            <Photo
              key={property.slug}
              src={property.media.cover}
              alt=""
              fill
              sizes="288px"
              className="object-cover transition-opacity duration-400"
              style={{ opacity: active === i ? 1 : 0 }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
