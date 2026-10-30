// Informes y Publicaciones.
//
// El contenido NO vive en este archivo: se lee del repositorio externo de
// documentos (ver `src/data/fuenteDocumentos.ts`) mediante la colección
// `publicaciones` definida en `src/content.config.ts`.
//
// Este módulo actúa como adaptador: expone los datos ya tipados, ordenados y
// listos para las páginas, de modo que la forma de consumirlos no cambie.
// Para publicar un informe nuevo, basta con subir el .md al repositorio.

import { getCollection } from 'astro:content';
import { conBase } from '../lib/rutas';
import { resolverRutaPdf, urlEnGitHub, urlRecurso, urlRepo } from './fuenteDocumentos';

export const categorias = {
  diagnostico: 'Diagnóstico',
  propuesta: 'Propuesta',
  opinion: 'Opinión',
} as const;

export type Categoria = keyof typeof categorias;

export interface Publicacion {
  id: string;
  titulo: string;
  /** Fecha ISO (AAAA-MM-DD o AAAA-MM). */
  fecha: string;
  categoria: Categoria;
  autor: string;
  extracto: string;
  /** Minutos de lectura estimados (0 si no se indicó). */
  lectura: number;
  /** true cuando el documento ya puede leerse en el visor. */
  disponible: boolean;
  /**
   * URL del PDF oficial, ya resuelta. Puede vivir en el repositorio de contenido
   * (`documentos/`) o en el propio sitio: ver `resolverRutaPdf`.
   */
  pdf?: string;
  /** Imagen de portada, si existe. */
  portada?: string;
  /** Palabras clave para búsqueda y SEO. */
  etiquetas: string[];
  /** true si la publicación está resaltada en la portada. */
  destacado: boolean;
  /** Cuerpo Markdown sin la cabecera YAML. */
  cuerpo: string;
}

/** Ordena por fecha descendente (lo más reciente primero). */
const porFechaDesc = (a: Publicacion, b: Publicacion) => b.fecha.localeCompare(a.fecha);

/** Todas las publicaciones, listas para las páginas. */
export const getPublicaciones = async (): Promise<Publicacion[]> => {
  const entradas = await getCollection('publicaciones');
  return entradas
    .map((e) => ({
      id: e.id,
      titulo: e.data.titulo,
      fecha: e.data.fecha,
      categoria: e.data.categoria,
      autor: e.data.autor,
      extracto: e.data.extracto,
      lectura: e.data.lectura ?? 0,
      disponible: e.data.estado === 'publicado',
      // El PDF se resuelve una sola vez acá: repositorio de contenido o sitio.
      pdf: e.data.pdf ? resolverRutaPdf(e.data.pdf) : undefined,
      // La portada siempre vive en el repositorio, en imagenes/<id>/.
      portada: e.data.portada ? urlRecurso(`imagenes/${e.id}/${e.data.portada}`) : undefined,
      etiquetas: e.data.etiquetas,
      destacado: e.data.destacado,
      cuerpo: e.body ?? '',
    }))
    .sort(porFechaDesc);
};

/** Alias de compatibilidad: mismas publicaciones, ya ordenadas. */
export const getPublicacionesOrdenadas = getPublicaciones;

/**
 * Página de una publicación. Desde que los informes se generan como HTML en el build,
 * es /publicaciones/<id>/ (indexable). El nombre se mantiene por compatibilidad; el
 * viejo /visor/?doc=<id> redirige aquí.
 */
export const urlVisor = (id: string) => conBase(`/publicaciones/${encodeURIComponent(id)}/`);
export const urlPublicacion = urlVisor;

/** Enlaces a PDF: se abren en pestaña nueva para no sacar al usuario del sitio. */
export const atributosPdf = { target: '_blank', rel: 'noopener' } as const;

const formatoFecha = new Intl.DateTimeFormat('es-PY', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export const fechaLegible = (iso: string) =>
  formatoFecha.format(new Date(iso.length === 7 ? `${iso}-01` : iso));

/**
 * Cita sugerida (estilo APA, autor institucional), lista para copiar:
 *   IPPSE (2026). Informe Técnico Nº 2/26 - … Instituto de Profesionales Paraguayos
 *   del Sector Eléctrico. https://…/visor/?doc=informe-2-26
 */
export const citaPublicacion = (p: Pick<Publicacion, 'id' | 'titulo' | 'fecha'>, site: URL) => {
  const titulo = p.titulo.replace(/[.\s]+$/, '');
  return `IPPSE (${p.fecha.slice(0, 4)}). ${titulo}. Instituto de Profesionales Paraguayos del Sector Eléctrico. ` +
    new URL(urlVisor(p.id), site).href;
};

/** Enlace al archivo fuente en GitHub (para el visor y la trazabilidad). */
export const urlFuenteDocumento = (id: string) =>
  urlEnGitHub(`contenido/publicaciones/${id}.md`);

/** Página del repositorio de documentos en GitHub. */
export { urlRepo as urlRepoDocumentos };
