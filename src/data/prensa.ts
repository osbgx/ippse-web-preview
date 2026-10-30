// Prensa y Novedades: el contenido vive en el repositorio de documentos (contenido/prensa/).
// Este módulo solo expone los datos ya tipados, ordenados y clasificados para las páginas.

import { getCollection, type CollectionEntry } from 'astro:content';
import { conBase } from '../lib/rutas';

export type EntradaPrensa = CollectionEntry<'prensa'>;
export type Comunicado = Extract<EntradaPrensa['data'], { tipo: 'comunicado' }> & { id: string };
export type AparicionMedio = Extract<EntradaPrensa['data'], { tipo: 'aparicion' }> & { id: string };
export type Evento = Extract<EntradaPrensa['data'], { tipo: 'evento' }> & { id: string };

/**
 * ¿La entrada tiene página propia (/prensa/<id>/)?
 * Una aparición en medios que solo enlaza la nota original (tiene `url` y no tiene
 * texto propio) no la necesita: sería una página vacía que solo agrega un clic.
 * En ese caso todos los enlaces del sitio (listado, RSS, buscador, cobertura)
 * van directo a la nota del medio. Si se le escribe un comentario, recupera su página.
 */
export const tienePagina = (e: Pick<EntradaPrensa, 'data' | 'body'>) =>
  !(e.data.tipo === 'aparicion' && e.data.url && !(e.body ?? '').trim());

/** URL de una entrada: su página propia o, si no tiene, la nota original del medio. */
export const urlEntradaPrensa = (e: Pick<EntradaPrensa, 'id' | 'data' | 'body'>) =>
  tienePagina(e) || e.data.tipo !== 'aparicion' || !e.data.url ? conBase(`/prensa/${e.id}/`) : e.data.url;

/** Ordena por fecha descendente (lo más reciente primero); el orden no depende del archivo. */
const porFechaDesc = (a: EntradaPrensa, b: EntradaPrensa) => b.data.fecha.localeCompare(a.data.fecha);

const conId = (e: EntradaPrensa) => ({ ...e.data, id: e.id });

/** Comunicados, del más reciente al más antiguo. */
export const getComunicados = async (): Promise<Comunicado[]> =>
  (await getCollection('prensa')).filter((e) => e.data.tipo === 'comunicado').sort(porFechaDesc).map(conId) as Comunicado[];

/** Apariciones en medios, de la más reciente a la más antigua. */
export const getApariciones = async (): Promise<AparicionMedio[]> =>
  (await getCollection('prensa')).filter((e) => e.data.tipo === 'aparicion').sort(porFechaDesc).map(conId) as AparicionMedio[];

/** Eventos divididos en próximos (hoy o después) y pasados, según la fecha actual. */
export const getEventos = async (): Promise<{ proximos: Evento[]; pasados: Evento[] }> => {
  const hoy = new Date().toISOString().slice(0, 10);
  const eventos = (await getCollection('prensa')).filter((e) => e.data.tipo === 'evento').sort(porFechaDesc).map(conId) as Evento[];
  // Próximos: del más cercano al más lejano (orden ascendente).
  const proximos = eventos.filter((e) => e.fecha >= hoy).reverse();
  const pasados = eventos.filter((e) => e.fecha < hoy);
  return { proximos, pasados };
};

/** Una nota de prensa vinculada a un informe, lista para mostrar. */
export interface Cobertura {
  id: string;
  titulo: string;
  medio: string;
  fecha: string;
  /** Nota original en el medio (si existe) o, si no, su página en el sitio. */
  url: string;
  externa: boolean;
}

/**
 * Cobertura en medios: apariciones que declaran el informe en su campo
 * `informes`, de la más reciente a la más antigua. Agrupadas por informe.
 */
export const getCoberturaPorInforme = async (): Promise<Map<string, Cobertura[]>> => {
  const mapa = new Map<string, Cobertura[]>();
  for (const a of await getApariciones()) {
    for (const informe of a.informes) {
      const lista = mapa.get(informe) ?? [];
      lista.push({
        id: a.id,
        titulo: a.titulo,
        medio: a.medio,
        fecha: a.fecha,
        url: a.url ?? conBase(`/prensa/${a.id}/`),
        externa: Boolean(a.url),
      });
      mapa.set(informe, lista);
    }
  }
  return mapa;
};

const formatoDia =new Intl.DateTimeFormat('es-PY', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
const formatoMes = new Intl.DateTimeFormat('es-PY', { month: 'short', year: 'numeric', timeZone: 'UTC' });

/** "12 oct 2026" o, si la fecha es solo AAAA-MM, "oct 2026". */
export const fechaCorta = (iso: string) =>
  (iso.length === 7 ? formatoMes : formatoDia).format(new Date(iso.length === 7 ? `${iso}-01` : iso)).replace('.', '');
