"use client";

import { useEffect, useRef } from "react";

/**
 * Trecerea dintre fotografiile din hero, desenată pe GPU.
 *
 * Un fade obișnuit suprapune două imagini și le schimbă opacitatea — la
 * mijlocul drumului se văd amândouă pe jumătate, ceea ce arată exact ca ce e:
 * două poze una peste alta. Aici trecerea se face pixel cu pixel, după un câmp
 * de zgomot: fotografia veche se destramă neuniform, iar cea nouă crește prin
 * ea, cu o mică deplasare în sens opus. Se citește ca o singură imagine care
 * se transformă, nu ca două care se suprapun.
 *
 * Scris direct în WebGL, fără three.js: sunt două triunghiuri și un shader,
 * n-are rost o librărie de 600 KB pentru asta.
 *
 * E strict un strat peste `<img>`-urile din HeroCinematic, care rămân în
 * pagină și fac toată treaba serioasă — LCP, varianta fără JS, fotografia care
 * trece în pagina proprietății. Pânza se aprinde abia după ce toate texturile
 * sunt gata; dacă lipsește WebGL, dacă o imagine nu se încarcă sau dacă omul a
 * cerut mai puțină mișcare, nu se montează deloc și rămâne fade-ul de dedesubt.
 */

/** Cât durează destrămarea. Sub ~800ms se citește ca o tăietură. */
const DISSOLVE = 1100;

/** Cât de tare se deplasează pixelii în timpul trecerii, în unități de UV. */
const DISPLACE = 0.06;

const VERTEX_SHADER = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

varying vec2 vUv;

uniform sampler2D uFrom;
uniform sampler2D uTo;
uniform vec2 uCanvas;
uniform vec2 uFromRes;
uniform vec2 uToRes;
uniform float uFromZoom;
uniform float uToZoom;
uniform float uProgress;

/* Aceeași încadrare pe care o face "object-fit: cover": imaginea umple pânza,
   iar surplusul se taie simetric. Fără asta, fotografiile portret ar apărea
   întinse pe un ecran lat. */
vec2 coverUv(vec2 uv, vec2 img, float zoom) {
  float canvasAspect = uCanvas.x / uCanvas.y;
  float imgAspect = img.x / img.y;
  vec2 scale = canvasAspect > imgAspect
    ? vec2(1.0, imgAspect / canvasAspect)
    : vec2(canvasAspect / imgAspect, 1.0);
  return (uv - 0.5) * scale / zoom + 0.5;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

/* Patru octave: una singură dă pete prea regulate, se vede grila. */
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int k = 0; k < 4; k++) {
    v += a * valueNoise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  /* fbm are valorile îngrămădite la mijloc: 90% din pixeli cad între 0.24 și
     0.68, cu mediana la 0.40. Folosit așa cum vine, pragul de mai jos mătură
     un interval în care mult timp nu se schimbă nimic — măsurat, trecerea era
     abia la 3% după un sfert din durată și sărea la 72% la jumătate, adică
     se împotmolea și apoi pocnea. Întindem banda utilă peste tot [0,1]. */
  float n = clamp((fbm(vUv * 3.2) - 0.24) / 0.44, 0.0, 1.0);

  /* Pragul urcă odată cu progresul, iar "banda" e lățimea marginii dintre
     ce s-a schimbat și ce nu. Fără bandă ar fi o muchie tăiată cu foarfeca. */
  float band = 0.35;
  float p = uProgress * (1.0 + band);
  float mask = 1.0 - smoothstep(p - band, p, n);

  /* Cele două fotografii se mișcă în sensuri opuse cât ține trecerea, cu
     amplitudinea maximă exact la mijloc. Asta dă senzația de material, nu de
     două straturi. */
  vec2 dir = vec2(0.0, 1.0);
  vec2 uvFrom = coverUv(vUv + dir * mask * ${DISPLACE.toFixed(3)}, uFromRes, uFromZoom);
  vec2 uvTo = coverUv(vUv - dir * (1.0 - mask) * ${DISPLACE.toFixed(3)}, uToRes, uToZoom);

  gl_FragColor = mix(texture2D(uFrom, uvFrom), texture2D(uTo, uvTo), mask);
}
`;

interface HeroCanvasProps {
  /** Aceleași căi ca `<img>`-urile de dedesubt — deci vin din cache, nu din rețea. */
  images: string[];
  /** Fotografia curentă. Schimbarea ei pornește destrămarea. */
  index: number;
  /** Cât stă o fotografie pe ecran — de aici iese ritmul zoom-ului. */
  interval: number;
}

export function HeroCanvas({ images, index, interval }: HeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /**
   * Starea de desen stă în ref, nu în state: se citește la 60 de cadre pe
   * secundă și n-are ce căuta în ciclul de randare al React.
   */
  const clock = useRef({ current: 0, previous: 0, since: 0, previousSince: 0 });

  // Marcăm momentul schimbării, ca bucla să știe de unde pornește destrămarea.
  useEffect(() => {
    const c = clock.current;
    if (c.current === index) return;
    c.previous = c.current;
    c.previousSince = c.since;
    c.current = index;
    c.since = performance.now();
  }, [index]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || images.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const gl =
      canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" }) ??
      null;
    if (!gl) return;

    let disposed = false;
    let frame = 0;
    let observer: IntersectionObserver | undefined;
    const textures: (WebGLTexture | null)[] = [];
    const sizes: [number, number][] = [];

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertex = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = vertex && fragment ? gl.createProgram() : null;
    if (!vertex || !fragment || !program) return;

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    // Două triunghiuri care acoperă tot ecranul. Nu e nevoie de nimic altceva.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = {
      from: gl.getUniformLocation(program, "uFrom"),
      to: gl.getUniformLocation(program, "uTo"),
      canvas: gl.getUniformLocation(program, "uCanvas"),
      fromRes: gl.getUniformLocation(program, "uFromRes"),
      toRes: gl.getUniformLocation(program, "uToRes"),
      fromZoom: gl.getUniformLocation(program, "uFromZoom"),
      toZoom: gl.getUniformLocation(program, "uToZoom"),
      progress: gl.getUniformLocation(program, "uProgress"),
    };
    gl.uniform1i(u.from, 0);
    gl.uniform1i(u.to, 1);

    const resize = () => {
      // Peste 2 nu se mai vede nimic în plus, dar se plătește în pixeli.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (w === canvas.width && h === canvas.height) return;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(u.canvas, w, h);
    };

    /**
     * Ken Burns, dar în shader: aceeași creștere lentă ca a fotografiei de
     * dedesubt, altfel imaginea ar îngheța exact când preia pânza.
     */
    const zoomAt = (since: number, now: number) =>
      1.02 + 0.12 * Math.min(1, (now - since) / (interval + DISSOLVE));

    /**
     * Cât timp hero-ul e sub linia de plutire nu desenăm nimic. Pagina are
     * șapte ecrane; o buclă GPU care merge degeaba pe restul lor se simte
     * imediat pe baterie.
     */
    let onScreen = true;

    const render = (now: number) => {
      const c = clock.current;
      const from = textures[c.previous];
      const to = textures[c.current];
      if (!from || !to) return;

      resize();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, from);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, to);
      gl.uniform2f(u.fromRes, sizes[c.previous][0], sizes[c.previous][1]);
      gl.uniform2f(u.toRes, sizes[c.current][0], sizes[c.current][1]);
      gl.uniform1f(u.fromZoom, zoomAt(c.previousSince, now));
      gl.uniform1f(u.toZoom, zoomAt(c.since, now));
      gl.uniform1f(u.progress, Math.min(1, (now - c.since) / DISSOLVE));
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const loop = (now: number) => {
      frame = onScreen ? requestAnimationFrame(loop) : 0;
      render(now);
    };

    const upload = (image: HTMLImageElement, slot: number) => {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      // Fotografiile n-au laturi puteri ale lui doi, deci în WebGL1 sunt
      // obligatorii CLAMP_TO_EDGE și filtrare fără mipmap-uri.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
      textures[slot] = texture;
      sizes[slot] = [image.naturalWidth, image.naturalHeight];
    };

    // Aceleași URL-uri ca `<img>`-urile din pagină, deci browserul le are deja
    // în cache — nu se descarcă nimic în plus.
    Promise.all(
      images.map(
        (src) =>
          new Promise<HTMLImageElement | null>((resolve) => {
            const image = new Image();
            image.decoding = "async";
            image.onload = () => resolve(image);
            image.onerror = () => resolve(null);
            image.src = src;
          }),
      ),
    ).then((loaded) => {
      // Dacă lipsește măcar una, nu pornim: mai bine fade-ul de dedesubt decât
      // o gaură neagră în locul unei fotografii.
      if (disposed || loaded.some((image) => image === null)) return;
      loaded.forEach((image, i) => upload(image as HTMLImageElement, i));
      resize();
      clock.current.since = performance.now() - DISSOLVE;
      clock.current.previousSince = clock.current.since;

      /**
       * Un cadru desenat ACUM, sincron, înainte de a face pânza vizibilă.
       * `requestAnimationFrame` nu rulează în taburile din fundal, iar pânza e
       * opacă: dacă am aprinde-o înainte să aibă ce arăta, peste fotografie ar
       * sta un dreptunghi negru până se întoarce omul la tab.
       */
      render(performance.now());
      canvas.style.opacity = "1";

      observer = new IntersectionObserver(
        ([entry]) => {
          onScreen = entry.isIntersecting;
          if (onScreen && !frame) frame = requestAnimationFrame(loop);
        },
        { threshold: 0 },
      );
      observer.observe(canvas);
      frame = requestAnimationFrame(loop);
    });

    return () => {
      disposed = true;
      observer?.disconnect();
      if (frame) cancelAnimationFrame(frame);
      textures.forEach((texture) => texture && gl.deleteTexture(texture));
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, [images, interval]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      // Se aprinde din JS, abia când are ce desena. Până atunci se vede
      // fotografia obișnuită de dedesubt, deci nu clipește nimic.
      className="pointer-events-none absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700"
    />
  );
}
