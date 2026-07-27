import Image, { type ImageProps } from "next/image";
import { basePath } from "@/lib/asset";
import { blurData } from "@/lib/blur-data";

type PhotoProps = Omit<ImageProps, "src" | "placeholder" | "blurDataURL"> & { src: string };

/**
 * `next/image` cu miniatura neclară deja atașată.
 *
 * Fără ea, fotografiile apar brusc: un dreptunghi gol, apoi dintr-odată poza.
 * Pe un site care trăiește din fotografii, asta e diferența cea mai vizibilă
 * dintre „făcut repede” și „făcut cu grijă”. Miniaturile sunt generate la
 * `npm run media` și au câteva sute de bytes fiecare, deci intră direct în
 * HTML — nicio cerere în plus.
 *
 * Cheia din hartă e calea fără prefixul de deploy; `src` vine deja cu el.
 */
export function Photo({ src, alt, ...rest }: PhotoProps) {
  const key = basePath && src.startsWith(basePath) ? src.slice(basePath.length) : src;
  const blur = blurData[key];

  if (!blur) {
    // Fără miniatură (fotografie adăugată fără să se ruleze `npm run media`)
    // mergem mai departe fără efect — mai bine decât o imagine lipsă.
    return <Image src={src} alt={alt} {...rest} />;
  }

  return <Image src={src} alt={alt} placeholder="blur" blurDataURL={blur} {...rest} />;
}
