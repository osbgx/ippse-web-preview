import type { APIRoute } from 'astro';
import { getEventos } from '../data/prensa';
import { respuestaIcs } from '../lib/ics';

/** Todos los eventos del IPPSE (próximos y pasados), para suscribirse. */
export const GET: APIRoute = async ({ site }) => {
  const { proximos, pasados } = await getEventos();
  return respuestaIcs([...proximos, ...pasados], site!, 'Eventos del IPPSE');
};
