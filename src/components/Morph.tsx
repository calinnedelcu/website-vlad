"use client";

import { ViewTransition, type ReactNode } from "react";

/**
 * Continuitate vizuală între pagini.
 *
 * Fără ea, un click pe o proprietate e o tăietură seacă: fotografia pe care ai
 * dat click dispare, iar pe pagina următoare apare alta, în alt loc. Ochiul nu
 * are cum să știe că e același lucru — trebuie să recitească pagina ca să se
 * asigure că a nimerit unde voia.
 *
 * Aici dăm aceluiași obiect același nume în ambele pagini. Browserul face
 * restul: fotografia se mută și își schimbă mărimea din poziția din listă în
 * poziția de hero. Nu e decor, e informație — spune „e același lucru, doar că
 * acum îl vezi de aproape”.
 *
 * Costul e zero: nicio librărie, niciun calcul de poziții în JS. Unde
 * browserul nu are View Transitions API, `<ViewTransition>` nu face nimic și
 * navigarea rămâne exact cum era.
 *
 * Numele se generează cu `morphName` din `@/lib/morph` — vezi acolo de ce nu
 * stă în fișierul ăsta.
 */
export function Morph({ name, children }: { name?: string; children: ReactNode }) {
  // `share="morph"` pune clasa `morph` pe tranziție, ca s-o putem tempera din
  // CSS — vezi `::view-transition-group(.morph)` din globals.css.
  return (
    <ViewTransition name={name} share="morph">
      {children}
    </ViewTransition>
  );
}
