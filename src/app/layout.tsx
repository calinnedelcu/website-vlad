import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StickyContact } from "@/components/StickyContact";
import { site } from "@/lib/site";
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

/** Cardul de share. Generat de `npm run media` — vezi scripts/build-og.mjs. */
const ogImage = {
  url: "/og.jpg",
  width: 1200,
  height: 630,
  alt: `${site.name} — ${site.role} în ${site.city}`,
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role} în ${site.city}`,
    template: `%s — ${site.name}`,
  },
  description: site.intro,
  openGraph: {
    type: "website",
    locale: "ro_RO",
    siteName: site.name,
    url: site.url,
    title: `${site.name} — ${site.role} în ${site.city}`,
    description: site.intro,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role} în ${site.city}`,
    description: site.intro,
    images: [ogImage.url],
  },
  alternates: { canonical: "/" },
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
        <SiteHeader />
        <main className="pt-20">{children}</main>
        <SiteFooter />
        <StickyContact />
      </body>
    </html>
  );
}
