import Link from "next/link";
import { nav, site } from "@/lib/site";
import { Reveal } from "./Reveal";

export function SiteFooter() {
  return (
    <footer className="bg-forest text-paper mt-32">
      <div className="shell py-24">
        <Reveal>
          <p className="eyebrow text-bronze-soft">Hai să vorbim</p>
          <h2 className="display-lg mt-6 max-w-3xl">
            Spune-mi ce cauți și îți trimit ce am, inclusiv ce nu e listat public.
          </h2>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-12 flex flex-wrap gap-4">
            <a
              href={site.contact.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="bg-paper text-ink hover:bg-bronze hover:text-paper px-8 py-4 text-sm transition-colors duration-300"
            >
              Scrie pe WhatsApp
            </a>
            <a
              href={site.contact.phoneHref}
              className="border-paper/40 hover:border-paper border px-8 py-4 text-sm transition-colors duration-300"
            >
              {site.contact.phone}
            </a>
          </div>
        </Reveal>

        <div className="border-paper/15 mt-24 grid gap-10 border-t pt-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="eyebrow text-paper/50">Navigare</p>
            <ul className="mt-4 space-y-2 text-sm">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-paper/80 hover:text-paper transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow text-paper/50">Contact</p>
            <ul className="text-paper/80 mt-4 space-y-2 text-sm">
              <li>
                <a href={site.contact.phoneHref} className="hover:text-paper transition-colors">
                  {site.contact.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.contact.email}`} className="hover:text-paper transition-colors">
                  {site.contact.email}
                </a>
              </li>
              <li className="text-paper/60">{site.contact.office}</li>
            </ul>
          </div>

          <div>
            <p className="eyebrow text-paper/50">Social</p>
            <ul className="mt-4 space-y-2 text-sm">
              {site.social.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-paper/80 hover:text-paper transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow text-paper/50">Agenție</p>
            <p className="text-paper/80 mt-4 text-sm">
              {site.role} la {site.agency}, {site.city}.
            </p>
          </div>
        </div>

        <div className="border-paper/15 text-paper/40 mt-12 flex flex-col gap-2 border-t pt-8 text-xs sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}
          </p>
          <p>Toate suprafețele sunt aproximative. Prețurile nu includ taxele notariale.</p>
        </div>
      </div>
    </footer>
  );
}
