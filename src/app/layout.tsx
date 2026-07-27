import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import { PageTransition } from "@/components/PageTransition";
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
    title: `${site.name} — ${site.role} în ${site.city}`,
    description: site.intro,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={`${instrumentSerif.variable} ${inter.variable}`}>
      <body>
        {/* Grain peste toată pagina — vezi .grain din globals.css */}
        <div className="grain" aria-hidden />
        <PageTransition />
        <SiteHeader />
        <main className="pt-20">{children}</main>
        <SiteFooter />
        <StickyContact />
      </body>
    </html>
  );
}
