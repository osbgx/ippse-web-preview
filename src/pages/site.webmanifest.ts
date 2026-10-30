import type { APIRoute } from 'astro';
import { conBase } from '../lib/rutas';
import { autorSitio, nombreInstitucion, nombreSitio } from '../data/seo';
import { descripcionCorta } from '../data/institucion';

export const GET: APIRoute = () => {
  const manifiesto = {
    name: `${nombreSitio} — ${nombreInstitucion}`,
    short_name: nombreSitio,
    description: descripcionCorta,
    lang: 'es-PY',
    dir: 'ltr',
    start_url: conBase('/'),
    scope: conBase('/'),
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0038a8',
    categories: ['education', 'news', 'government'],
    author: autorSitio.nombre,
    developer: { name: autorSitio.nombre, url: autorSitio.url },
    icons: [
      { src: conBase('/icon-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: conBase('/icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: conBase('/icon-maskable-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: conBase('/favicon.svg'), sizes: 'any', type: 'image/svg+xml' },
    ],
  };
  return new Response(JSON.stringify(manifiesto, null, 2), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
};
