// Contenido de llms.txt y llms-full.txt (formato propuesto en https://llmstxt.org):
// un resumen en Markdown del sitio para modelos de lenguaje y buscadores con IA.

import { getCollection, getEntry } from 'astro:content';
import { autorSitio, dominio, nombreInstitucion, paginasIndexables, urlAbsoluta } from '../data/seo';
import { contacto } from '../data/contacto';
import {
  descripcionCorta, ejesEstrategicos, fundacion, historia, lema, mision, valores, vision,
} from '../data/institucion';
import { categorias, getPublicaciones } from '../data/publicaciones';
import { fechaCorta, urlEntradaPrensa } from '../data/prensa';

const etiquetasPrensa = { comunicado: 'Comunicado', aparicion: 'Aparición en medios', evento: 'Evento' } as const;

export const generarLlms = async (site: URL, completo: boolean): Promise<string> => {
  const url = (ruta: string) => urlAbsoluta(ruta, site);
  const prensa = (await getCollection('prensa')).sort((a, b) => b.data.fecha.localeCompare(a.data.fecha));
  const publicacionesOrdenadas = await getPublicaciones();

  const lineas: string[] = [
    `# IPPSE — ${nombreInstitucion}`,
    '',
    `> ${lema} ${descripcionCorta}`,
    '',
    `- Sitio oficial: https://${dominio}/`,
    `- Fundación: ${fundacion}`,
    `- Sede: ${contacto.ciudad}`,
    `- Correo: ${contacto.email}`,
    '- Idioma del contenido: español (Paraguay); índices principales también en inglés (/en/) y portugués (/pt/), con el resto del contenido en español.',
    `- Autor del sitio: ${autorSitio.nombre} (${autorSitio.url})`,
    '',
    '## Quiénes somos',
    '',
    ...historia.parrafos.flatMap((p) => [p, '']),
    `**Misión:** ${mision}`,
    '',
    `**Visión:** ${vision}`,
    '',
    `**Valores:** ${valores.map((v) => `${v.titulo} (${v.descripcion})`).join('; ')}`,
    '',
    '**Ejes estratégicos:**',
    '',
    ...ejesEstrategicos.map((e) => `- ${e.titulo}: ${e.descripcion}`),
    '',
    '## Páginas principales',
    '',
    ...paginasIndexables.map((p) => `- [${p.titulo}](${url(p.ruta)}): ${p.descripcion}`),
    `- [Constitución del IPPSE (PDF)](${url('/documentos/constitucion-ippse.pdf')}): Acta y documento fundacional del Instituto.`,
    '',
    '## Informes y publicaciones',
    '',
    ...publicacionesOrdenadas.map((p) => {
      const enlace = p.pdf ? new URL(p.pdf, site).href : url('/publicaciones/');
      return `- [${p.titulo}](${enlace}): ${categorias[p.categoria]} · ${p.fecha} · ${p.autor}. ${p.extracto}`;
    }),
    '',
    '## Prensa y novedades',
    '',
    ...prensa.map((e) => {
      const d = e.data;
      const detalle = d.tipo === 'comunicado' ? d.extracto : d.tipo === 'aparicion' ? d.medio : `${d.tipoEvento}, ${d.lugar}`;
      return `- [${d.titulo}](${new URL(urlEntradaPrensa(e), site).href}): ${etiquetasPrensa[d.tipo]} · ${fechaCorta(d.fecha)} · ${detalle}`;
    }),
    '',
  ];

  if (completo) {
    const institucional = await getEntry('institucional', 'constitucion');
    if (institucional?.body) {
      lineas.push('## Documentos institucionales (texto completo)', '', institucional.body.trim().replace(/^(#{1,4}) /gm, '##$1 '), '');
    }
    lineas.push('## Prensa y novedades (texto completo)', '');
    for (const e of prensa) {
      lineas.push(`### ${e.data.titulo}`, '', `${etiquetasPrensa[e.data.tipo]} · ${e.data.fecha} · ${new URL(urlEntradaPrensa(e), site).href}`, '');
      if (e.body) lineas.push(e.body.trim().replace(/^## /gm, '#### '), '');
    }
  } else {
    lineas.push(
      '## Optional',
      '',
      `- [Texto completo para LLMs](${url('/llms-full.txt')}): documentos institucionales y notas de prensa completas.`,
      `- [Mapa del sitio](${url('/sitemap.xml')}): todas las URL indexables.`,
      `- [humans.txt](${url('/humans.txt')}): autoría del sitio (${autorSitio.nombre}).`,
      '',
    );
  }

  return lineas.join('\n');
};
