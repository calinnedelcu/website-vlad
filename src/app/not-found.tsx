import Link from "next/link";

export default function NotFound() {
  return (
    <section className="shell flex min-h-[70vh] flex-col justify-center py-24">
      <p className="eyebrow">404</p>
      <h1 className="display-lg mt-6 max-w-[20ch]">Pagina nu există.</h1>
      <p className="lede mt-6 max-w-[46ch]">
        Poate proprietatea a fost vândută, închiriată sau retrasă. Ce e disponibil acum găsești în
        portofoliu.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/proprietati"
          className="bg-ink text-paper hover:bg-bronze px-8 py-4 text-sm transition-colors duration-300"
        >
          Vezi portofoliul
        </Link>
        <Link
          href="/contact"
          className="border-ink hover:bg-ink hover:text-paper border px-8 py-4 text-sm transition-colors duration-300"
        >
          Contact
        </Link>
      </div>
    </section>
  );
}
