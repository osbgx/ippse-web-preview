// Glosario técnico y preguntas frecuentes.
//
// El contenido NO vive aquí: se lee del repositorio de documentos
// (contenido/glosario/ y contenido/preguntas-frecuentes/, un .md por entrada).
// Este módulo lo entrega ordenado y listo para las páginas.

import { getCollection } from 'astro:content';
import { conBase } from '../lib/rutas';

export interface Termino {
  /** Nombre del archivo sin .md: es también el ancla (/glosario/#hvdc). */
  id: string;
  termino: string;
  sigla?: string;
  /** Definición en HTML (admite enlaces y énfasis). */
  html: string;
  /** Definición en texto plano, para los datos estructurados. */
  texto: string;
  relacionados: string[];
}

export interface Pregunta {
  id: string;
  pregunta: string;
  html: string;
  texto: string;
}

/** Markdown -> texto plano (para JSON-LD): quita enlaces, énfasis y listas. */
const textoPlano = (md: string) =>
  md
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`#>]/g, '')
    .replace(/^\s*-\s+/gm, '')
    .replace(/\n{2,}/g, '\n\n')
    .trim();

/**
 * Los enlaces internos del contenido se escriben desde la raíz ("/glosario/#hvdc"):
 * se les agrega el base del sitio para que funcionen también en /ippse-web/.
 */
const conBaseEnHtml = (html: string) => html.replace(/href="\/(?!\/)/g, `href="${conBase('/')}`);

/** Letra inicial sin tilde, para el índice alfabético. */
export const inicial = (t: Pick<Termino, 'termino'>) =>
  t.termino.normalize('NFD').replace(/\p{M}/gu, '').charAt(0).toUpperCase();

/** Términos en orden alfabético (sin distinguir tildes). */
export const getGlosario = async (): Promise<Termino[]> =>
  (await getCollection('glosario'))
    .map((e) => ({
      id: e.id,
      termino: e.data.termino,
      sigla: e.data.sigla,
      html: conBaseEnHtml(e.rendered?.html ?? ''),
      texto: textoPlano(e.body ?? ''),
      relacionados: e.data.relacionados,
    }))
    .sort((a, b) => a.termino.localeCompare(b.termino, 'es'));

/** Preguntas según su campo `orden`. */
export const getPreguntas = async (): Promise<Pregunta[]> =>
  (await getCollection('preguntasFrecuentes'))
    .sort((a, b) => a.data.orden - b.data.orden || a.id.localeCompare(b.id))
    .map((e) => ({
      id: e.id,
      pregunta: e.data.pregunta,
      html: conBaseEnHtml(e.rendered?.html ?? ''),
      texto: textoPlano(e.body ?? ''),
    }));
