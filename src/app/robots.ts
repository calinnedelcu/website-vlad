import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Obligatoriu cu `output: "export"`. Fișierele astea se compilează în Route
 * Handlers, iar la export static Next cere să spui explicit că răspunsul nu
 * depinde de cerere — altfel build-ul se oprește cu eroare. Nu e o setare de
 * performanță, e o declarație: aici nu se citește nimic din request.
 */
export const dynamic = "force-static";

/**
 * Nimic de ascuns: tot site-ul e public și vrem să fie găsit.
 *
 * Rostul fișierului nu e să interzică ceva, ci să spună unde e sitemap-ul —
 * altfel motorul îl găsește doar dacă îl ghicește sau dacă i-l dai tu de mână
 * în Search Console.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
