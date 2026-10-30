import type { APIRoute } from 'astro';
import { autorSitio, dominio, nombreInstitucion } from '../data/seo';
import { contacto } from '../data/contacto';

// humans.txt (humanstxt.org): quién hizo el sitio.
export const GET: APIRoute = () => {
  const cuerpo = [
    '/* TEAM */',
    `  Autor: ${autorSitio.nombre}`,
    `  Sitio: ${autorSitio.url}`,
    '  Rol: diseño y desarrollo web',
    '',
    '/* CLIENTE */',
    `  ${nombreInstitucion} (IPPSE)`,
    `  Contacto: ${contacto.email}`,
    `  Ubicación: ${contacto.ciudad}`,
    '',
    '/* SITE */',
    `  Dominio: ${dominio}`,
    `  Última actualización: ${new Date().toISOString().slice(0, 10)}`,
    '  Idioma: español (Paraguay)',
    '  Estándares: HTML5, CSS3, WCAG 2.2, schema.org',
    '  Componentes: Astro, Tailwind CSS, Lucide, Source Sans 3, Source Serif 4',
    '',
  ];
  return new Response(cuerpo.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
