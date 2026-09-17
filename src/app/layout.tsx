import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { StructuredData } from "@/components/StructuredData";
import { Analytics } from "@/components/Analytics";
import { SiteFooter } from "@/components/SiteFooter";
import { StickyContact } from "@/components/StickyContact";
import { site } from "@/lib/site";
import { ogImage, openGraphBase } from "@/lib/metadata";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role} în ${site.city}`,
    template: `%s — ${site.name}`,
  },
  description: site.intro,
  openGraph: {
    ...openGraphBase,
    url: "/",
    title: `${site.name} — ${site.role} în ${site.city}`,
    description: site.intro,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role} în ${site.city}`,
    description: site.intro,
    images: [ogImage.url],
  },
  // Fără `alternates` aici, dinadins. Metadatele se îmbină superficial, iar o
  // cheie pusă în layout e moștenită de FIECARE pagină care n-o rescrie. Un
  // `canonical: "/"` pus aici spunea Google, de pe /proprietati, /tranzactii,
  // /contact și de pe toate anunțurile: „nu mă indexa pe mine, indexează prima
  // pagină, eu sunt o copie a ei”. Adică exact invers decât vrem.
  //
  // Canonical-ul e o afirmație despre O pagină anume, deci se scrie în pagina
  // aceea. Vezi `src/app/page.tsx` și surorile ei.
};

/** Culoarea barei de sus în browserele de telefon — se leagă cu hero-ul negru. */
export const viewport: Viewport = {
  themeColor: "#0b0c0a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={`${instrumentSerif.variable} ${inter.variable}`}>
      <body>
        {/* Grain peste toată pagina — vezi .grain din globals.css */}
        <div className="grain" aria-hidden />
        {/* Cine e Vlad, pentru mașini. Vezi StructuredData. */}
        <StructuredData />
        <SiteHeader />
        <main className="pt-20">{children}</main>
        <SiteFooter />
        <StickyContact />
        {/* Numărătoarea vizitelor, fără cookie-uri. Vezi Analytics. */}
        <Analytics />
      </body>
    </html>
  );
}
