import type { APIRoute, GetStaticPaths } from 'astro';
import { getEventos, type Evento } from '../../data/prensa';
import { respuestaIcs } from '../../lib/ics';

/** Un archivo .ics por evento: /prensa/<id>.ics ("Agregar a mi calendario"). */
export const getStaticPaths: GetStaticPaths = async () => {
  const { proximos, pasados } = await getEventos();
  return [...proximos, ...pasados].map((evento) => ({ params: { id: evento.id }, props: { evento } }));
};

export const GET: APIRoute = ({ props, site }) =>
  respuestaIcs([(props as { evento: Evento }).evento], site!, (props as { evento: Evento }).evento.titulo);
