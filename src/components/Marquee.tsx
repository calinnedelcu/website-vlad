/**
 * Banda cu text care curge lateral. Rupe ritmul vertical al paginii și dă
 * senzația de mișcare continuă între două secțiuni statice.
 *
 * Lista se dublează în markup, iar animația translatează exact -50% — așa
 * bucla nu se vede. Dacă schimbi una, schimb-o și pe cealaltă.
 */
export function Marquee({ items }: { items: readonly string[] }) {
  const loop = [...items, ...items];

  return (
    <div className="border-void-line bg-void text-paper overflow-hidden border-y py-7 md:py-9">
      <div className="marquee-track" aria-hidden>
        {loop.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center whitespace-nowrap">
            <span className="font-display px-8 text-3xl md:px-12 md:text-5xl">{item}</span>
            <span className="bg-bronze-soft h-1.5 w-1.5 shrink-0 rounded-full" />
          </span>
        ))}
      </div>
      {/* Varianta citibilă pentru cititoarele de ecran: banda de sus e pur decorativă. */}
      <span className="sr-only">Zone acoperite: {items.join(", ")}.</span>
    </div>
  );
}
