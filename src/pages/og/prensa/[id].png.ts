// Imagen para compartir de cada comunicado o evento con página propia: /og/prensa/<id>.png
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { fechaCorta, tienePagina, type EntradaPrensa } from '../../../data/prensa';
import { generarImagenOg } from '../../../lib/imagen-og';

const etiquetas = { comunicado: 'Comunicado de prensa', aparicion: 'En los medios', evento: 'Evento' } as const;

export const getStaticPaths: GetStaticPaths = async () =>
  (await getCollection('prensa')).filter(tienePagina).map((entrada) => ({ params: { id: entrada.id }, props: { entrada } }));

export const GET: APIRoute = async ({ props }) => {
  const { data } = (props as { entrada: EntradaPrensa }).entrada;
  const detalle = data.tipo === 'evento' ? ` · ${data.lugar}` : data.tipo === 'aparicion' ? ` · ${data.medio}` : '';
  const png = await generarImagenOg({
    etiqueta: data.tipo === 'evento' ? data.tipoEvento : etiquetas[data.tipo],
    titulo: data.titulo,
    pie: `${fechaCorta(data.fecha)}${detalle}`,
  });
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
