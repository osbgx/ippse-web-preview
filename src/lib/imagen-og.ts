// Imágenes para compartir (Open Graph, 1200×630) generadas en el build: una por
// informe y por nota de prensa, con su título. Es lo que muestran WhatsApp,
// LinkedIn, X o Facebook al compartir el enlace.
//
// Satori arma el diseño (con la tipografía del sitio) y resvg lo convierte a PNG.

import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const require = createRequire(import.meta.url);
const fuente = (archivo: string) =>
  readFile(require.resolve(`@fontsource/source-serif-4/files/${archivo}`));

// Se cargan una vez por build.
const fuentes = Promise.all([
  fuente('source-serif-4-latin-400-normal.woff'),
  fuente('source-serif-4-latin-700-normal.woff'),
]).then(([normal, negrita]) => [
  { name: 'Serif', data: normal, weight: 400 as const, style: 'normal' as const },
  { name: 'Serif', data: negrita, weight: 700 as const, style: 'normal' as const },
]);

// Colores del sitio (franjas de la bandera en el logo).
const ROJO = '#d52b1e';
const AZUL = '#0038a8';
const TINTA = '#111827';
const GRIS = '#4b5563';

type Nodo = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown): Nodo => ({
  type,
  props: { style, children },
});

export interface DatosOg {
  /** Rótulo superior: "Informe técnico", "Comunicado de prensa"… */
  etiqueta: string;
  titulo: string;
  /** Línea inferior: fecha, autor… */
  pie: string;
}

export async function generarImagenOg({ etiqueta, titulo, pie }: DatosOg): Promise<Buffer> {
  // Títulos largos: letra más chica para que entren en 4 líneas.
  const tamano = titulo.length > 140 ? 44 : titulo.length > 90 ? 52 : 62;

  const arbol = h(
    'div',
    { width: 1200, height: 630, display: 'flex', background: '#ffffff', fontFamily: 'Serif' },
    [
      h('div', { width: 18, height: 630, background: ROJO }),
      h(
        'div',
        { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 72px', flex: 1 },
        [
          h('div', { display: 'flex', flexDirection: 'column' }, [
            h('div', { display: 'flex', flexDirection: 'column', width: 210 }, [
              h('div', { fontSize: 56, fontWeight: 700, color: TINTA, letterSpacing: 1, lineHeight: 1 }, 'IPPSE'),
              h('div', { display: 'flex', flexDirection: 'column', marginTop: 10 }, [
                h('div', { height: 7, background: ROJO }),
                h('div', { height: 7, background: '#ffffff' }),
                h('div', { height: 7, background: AZUL }),
              ]),
            ]),
            h('div', { marginTop: 44, fontSize: 30, fontWeight: 700, color: ROJO }, etiqueta),
            h(
              'div',
              { marginTop: 16, fontSize: tamano, fontWeight: 700, color: TINTA, lineHeight: 1.15, maxHeight: tamano * 1.15 * 4, overflow: 'hidden' },
              titulo,
            ),
          ]),
          h('div', { display: 'flex', justifyContent: 'space-between', fontSize: 26, color: GRIS }, [
            h('div', {}, pie),
            h('div', {}, 'ippse.org.py'),
          ]),
        ],
      ),
    ],
  );

  const svg = await satori(arbol as unknown as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: await fuentes,
  });
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}
