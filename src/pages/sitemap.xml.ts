import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { autorSitio, imagenSocial, paginasIndexables, urlAbsoluta } from '../data/seo';
import { getPublicaciones } from '../data/publicaciones';
import { tienePagina } from '../data/prensa';
import { RUTAS_TRADUCIDAS } from '../data/i18n';

const escapar = (texto: string) =>
  texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

interface Entrada {
  loc: string;
  lastmod?: string;
  changefreq: string;
  priority: number;
  imagen?: string;
}

// lastmod nunca puede ser futuro (los eventos próximos tienen fecha posterior al build).
const hoy = new Date().toISOString().slice(0, 10);
const noFutura = (fecha: string) => {
  const completa = fecha.length === 7 ? `${fecha}-01` : fecha;
  return completa > hoy ? hoy : completa;
};

export const GET: APIRoute = async ({ site }) => {
  const prensa = await getCollection('prensa');
  const publicacionesOrdenadas = await getPublicaciones();
  const ultimaPrensa = noFutura(prensa.map((e) => e.data.fecha).sort().at(-1) ?? hoy);
  const ultimaPublicacion = publicacionesOrdenadas[0]?.fecha;
  const ultimaFecha: Record<string, string | undefined> = {
    '/': [ultimaPrensa, ultimaPublicacion].filter(Boolean).sort().at(-1),
    '/publicaciones/': ultimaPublicacion,
    '/prensa/': ultimaPrensa,
  };

  const entradas: Entrada[] = [
    ...paginasIndexables.map((p) => ({
      loc: urlAbsoluta(p.ruta, site!),
      lastmod: ultimaFecha[p.ruta],
      changefreq: p.frecuencia,
      priority: p.prioridad,
      imagen: p.ruta === '/' ? urlAbsoluta(imagenSocial.ruta, site!) : undefined,
    })),
    // Páginas espejo EN/PT de las rutas legibles: heredan fecha y frecuencia
    // del original; la prioridad baja levemente.
    ...RUTAS_TRADUCIDAS.flatMap((ruta) => {
      const original = paginasIndexables.find((p) => p.ruta === ruta);
      if (!original) return [];
      return (['en', 'pt'] as const).map((lang) => {
        // Ruta interna del espejo sin base (urlAbsoluta ya añade el base).
        const interna = ruta === '/' ? `/${lang}/` : `/${lang}${ruta}`;
        return {
          loc: urlAbsoluta(interna, site!),
          lastmod: ultimaFecha[ruta],
          changefreq: original.frecuencia,
          priority: Number((original.prioridad * 0.8).toFixed(2)),
        };
      });
    }),
    // Cada informe publicado, con su imagen para compartir.
    ...publicacionesOrdenadas
      .filter((p) => p.disponible)
      .map((p) => ({
        loc: urlAbsoluta(`/publicaciones/${p.id}/`, site!),
        lastmod: noFutura(p.fecha),
        changefreq: 'yearly',
        priority: 0.9,
        imagen: urlAbsoluta(`/og/publicaciones/${p.id}.png`, site!),
      })),
    ...prensa
      .filter(tienePagina)
      .sort((a, b) => b.data.fecha.localeCompare(a.data.fecha))
      .map((e) => ({
        loc: urlAbsoluta(`/prensa/${e.id}/`, site!),
        lastmod: noFutura(e.data.fecha),
        changefreq: 'yearly',
        priority: 0.5,
      })),
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<!-- Sitemap del IPPSE · Autor: ${autorSitio.nombre} — ${autorSitio.url} -->`,
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...entradas.map((e) =>
      [
        '  <url>',
        `    <loc>${escapar(e.loc)}</loc>`,
        e.lastmod && `    <lastmod>${e.lastmod}</lastmod>`,
        `    <changefreq>${e.changefreq}</changefreq>`,
        `    <priority>${e.priority.toFixed(1)}</priority>`,
        e.imagen && `    <image:image><image:loc>${escapar(e.imagen)}</image:loc></image:image>`,
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n'),
    ),
    '</urlset>',
    '',
  ].join('\n');

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
