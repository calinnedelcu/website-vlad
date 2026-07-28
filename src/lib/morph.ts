/**
 * Numele sub care o fotografie e „același obiect” în două pagini diferite.
 *
 * Stă aici, într-un modul obișnuit, și nu lângă componenta `Morph` — aceea e
 * marcată `"use client"`, iar tot ce exportă un modul client devine o referință
 * către client. O funcție de acolo nu poate fi *apelată* pe server, doar
 * randată ca element. Pagina de proprietate e Server Component și are nevoie de
 * numele ăsta, deci trebuie să vină dintr-un loc pe care îl pot citi amândouă.
 *
 * Prefixul evită coliziunea cu numele fixe, ca `site-header`.
 */
export const morphName = (slug: string) => `prop-${slug}`;
