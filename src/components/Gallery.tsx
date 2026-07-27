"use client";

import { Photo } from "./Photo";
import { useCallback, useEffect, useState } from "react";
import { Reveal } from "./Reveal";

/**
 * Galerie editorială: imaginile alternează lățimea, ca într-un layout de revistă.
 * Click deschide lightbox-ul, cu navigare din tastatură.
 */
export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [openAt, setOpenAt] = useState<number | null>(null);

  const close = useCallback(() => setOpenAt(null), []);
  const step = useCallback(
    (delta: number) => setOpenAt((i) => (i === null ? null : (i + delta + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (openAt === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openAt, close, step]);

  return (
    <>
      <div className="space-y-6 md:space-y-16">
        {images.map((src, i) => {
          // Ritm: mare, îngustă-dreapta, mare, îngustă-stânga...
          const narrow = i % 3 !== 0;
          const alignRight = i % 6 === 1 || i % 6 === 2;

          return (
            <Reveal key={src} variant="image">
              <button
                type="button"
                onClick={() => setOpenAt(i)}
                className={`group relative block w-full cursor-zoom-in overflow-hidden ${
                  narrow ? "aspect-[4/3] md:w-[62%]" : "aspect-[16/9]"
                } ${narrow && alignRight ? "md:ml-auto" : ""}`}
              >
                <Photo
                  src={src}
                  alt={`${title} — imaginea ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 70vw"
                  className="media-zoom object-cover"
                />
              </button>
            </Reveal>
          );
        })}
      </div>

      {openAt !== null && (
        <div
          className="bg-ink/96 fixed inset-0 z-[100] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={`Galerie — ${title}`}
          onClick={close}
        >
          <div className="relative h-[82vh] w-[92vw]" onClick={(e) => e.stopPropagation()}>
            <Photo
              src={images[openAt]}
              alt={`${title} — imaginea ${openAt + 1}`}
              fill
              sizes="92vw"
              className="object-contain"
            />
          </div>

          <button
            type="button"
            onClick={close}
            className="text-paper/70 hover:text-paper absolute top-6 right-6 text-sm tracking-[0.14em] uppercase"
          >
            Închide
          </button>

          <div
            className="text-paper/70 absolute bottom-8 flex items-center gap-8 text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={() => step(-1)} className="hover:text-paper" aria-label="Imaginea anterioară">
              ←
            </button>
            <span className="tabular-nums">
              {openAt + 1} / {images.length}
            </span>
            <button type="button" onClick={() => step(1)} className="hover:text-paper" aria-label="Imaginea următoare">
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
