import type { APIRoute } from 'astro';
import { autorSitio, dominio, esCopiaDeRevision, urlAbsoluta } from '../data/seo';

// Rastreadores de IA admitidos de forma explícita: el sitio publica llms.txt para ellos.
const rastreadoresIA = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'Google-Extended',
  'PerplexityBot',
  'Perplexity-User',
  'Applebot-Extended',
  'Meta-ExternalAgent',
  'CCBot',
];

export const GET: APIRoute = ({ site }) => {
  const cabecera = [
    `# robots.txt — IPPSE · ${dominio}`,
    `# Autor: ${autorSitio.nombre} — ${autorSitio.url}`,
    '',
  ];

  // Copia de revisión en GitHub Pages: no se indexa (evita contenido duplicado con el dominio oficial).
  if (esCopiaDeRevision) {
    return new Response([...cabecera, 'User-agent: *', 'Disallow: /', ''].join('\n'), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // /visor/ no se bloquea aquí: lleva meta noindex y el rastreador tiene que poder leerla.
  const reglas = ['Allow: /', 'Disallow: /enviar.php', ''];
  const cuerpo = [
    ...cabecera,
    'User-agent: *',
    ...reglas,
    '# Modelos de lenguaje y buscadores con IA: bienvenidos. Resumen del sitio en /llms.txt',
    ...rastreadoresIA.map((ua) => `User-agent: ${ua}`),
    ...reglas,
    `Sitemap: ${urlAbsoluta('/sitemap.xml', site!)}`,
    '',
    `# LLMs: ${urlAbsoluta('/llms.txt', site!)}`,
    `# LLMs (texto completo): ${urlAbsoluta('/llms-full.txt', site!)}`,
    `# Humanos: ${urlAbsoluta('/humans.txt', site!)}`,
    '',
  ];

  return new Response(cuerpo.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
