// Feeds RSS 2.0 del sitio (informes, prensa y global).
//
// Se arman a mano para no sumar dependencias: el formato es chico y estable.
// Cada feed se publica como página estática (src/pages/*.xml.ts).

import { getCollection } from 'astro:content';
import { urlEntradaPrensa } from '../data/prensa';
import { getPublicaciones, urlVisor } from '../data/publicaciones';
import { autorSitio, nombreInstitucion, nombreSitio, urlAbsoluta } from '../data/seo';
import { contacto } from '../data/contacto';
import { conBase } from './rutas';

export interface ItemRss {
  titulo: string;
  /** URL absoluta. */
  enlace: string;
  descripcion: string;
  /** Fecha ISO (AAAA-MM-DD o AAAA-MM). */
  fecha: string;
  categoria: string;
}

export interface Feed {
  /** Ruta del propio feed, p. ej. "/rss.xml". */
  ruta: string;
  titulo: string;
  descripcion: string;
}

/** Feeds disponibles: se anuncian en el <head> y en el pie. */
export const feeds = {
  global: { ruta: '/rss.xml', titulo: `${nombreSitio} — Informes y novedades`, descripcion: 'Informes técnicos, comunicados y novedades del IPPSE.' },
  informes: { ruta: '/informes.xml', titulo: `${nombreSitio} — Informes y Publicaciones`, descripcion: 'Diagnósticos, propuestas y ensayos técnicos del IPPSE.' },
  prensa: { ruta: '/prensa.xml', titulo: `${nombreSitio} — Prensa y Novedades`, descripcion: 'Comunicados, apariciones en medios y eventos del IPPSE.' },
  comunicados: { ruta: '/prensa-comunicados.xml', titulo: `${nombreSitio} — Comunicados de prensa`, descripcion: 'Comunicados oficiales del IPPSE.' },
} satisfies Record<string, Feed>;

const escapar = (texto: string) =>
  texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** RFC 822, como exige RSS 2.0. Las fechas AAAA-MM se fijan al día 1. */
const fechaRss = (iso: string) => new Date(`${iso.length === 7 ? `${iso}-01` : iso}T12:00:00Z`).toUTCString();

const hoy = new Date().toISOString().slice(0, 10);

const tiposPrensa = { comunicado: 'Comunicado', aparicion: 'En los medios', evento: 'Evento' } as const;

export const itemsInformes = async (site: URL): Promise<ItemRss[]> =>
  (await getPublicaciones())
    .filter((p) => p.disponible)
    .map((p) => ({
      titulo: p.titulo,
      enlace: new URL(urlVisor(p.id), site).href,
      descripcion: p.extracto,
      fecha: p.fecha,
      categoria: 'Informes y Publicaciones',
    }));

export const itemsPrensa = async (site: URL, tipo?: keyof typeof tiposPrensa): Promise<ItemRss[]> =>
  (await getCollection('prensa'))
    // Los eventos futuros no son noticias todavía: un feed no debe anunciar fechas por venir.
    .filter((e) => (!tipo || e.data.tipo === tipo) && e.data.fecha <= hoy)
    .map((e) => ({
      titulo: e.data.titulo,
      enlace: new URL(urlEntradaPrensa(e), site).href,
      descripcion: e.data.extracto ?? e.data.titulo,
      fecha: e.data.fecha,
      categoria: tiposPrensa[e.data.tipo],
    }));

export const respuestaRss = (feed: Feed, items: ItemRss[], site: URL) => {
  const ordenados = [...items].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const urlFeed = urlAbsoluta(feed.ruta, site);
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapar(feed.titulo)}</title>`,
    `    <link>${escapar(new URL(conBase('/'), site).href)}</link>`,
    `    <description>${escapar(feed.descripcion)}</description>`,
    '    <language>es-PY</language>',
    `    <copyright>© ${new Date().getFullYear()} ${escapar(nombreInstitucion)}</copyright>`,
    `    <managingEditor>${escapar(`${contacto.email} (${nombreSitio})`)}</managingEditor>`,
    `    <generator>${escapar(`${autorSitio.nombre} — ${autorSitio.url}`)}</generator>`,
    `    <atom:link href="${escapar(urlFeed)}" rel="self" type="application/rss+xml" />`,
    ordenados[0] && `    <lastBuildDate>${fechaRss(ordenados[0].fecha)}</lastBuildDate>`,
    ...ordenados.map((i) =>
      [
        '    <item>',
        `      <title>${escapar(i.titulo)}</title>`,
        `      <link>${escapar(i.enlace)}</link>`,
        `      <guid isPermaLink="true">${escapar(i.enlace)}</guid>`,
        `      <description>${escapar(i.descripcion)}</description>`,
        `      <category>${escapar(i.categoria)}</category>`,
        `      <pubDate>${fechaRss(i.fecha)}</pubDate>`,
        '    </item>',
      ].join('\n'),
    ),
    '  </channel>',
    '</rss>',
    '',
  ]
    .filter(Boolean)
    .join('\n');

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
