// Commit del repositorio de contenido con el que se generó el sitio publicado.
//
// Lo consulta el workflow de publicación (revisión periódica): si el último
// commit del repositorio de documentos es distinto de este, recompila; si es
// igual, no gasta minutos de build.
import type { APIRoute } from 'astro';
import { commitDocumentos } from '../data/commitDocumentos';
import { modoLocal } from '../data/fuenteDocumentos';

export const GET: APIRoute = () =>
  new Response(`${modoLocal ? 'local' : (commitDocumentos() ?? 'desconocido')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
