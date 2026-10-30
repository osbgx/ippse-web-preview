// Imagen para compartir de cada informe: /og/publicaciones/<id>.png
import type { APIRoute, GetStaticPaths } from 'astro';
import { categorias, fechaLegible, getPublicaciones, type Publicacion } from '../../../data/publicaciones';
import { generarImagenOg } from '../../../lib/imagen-og';

export const getStaticPaths: GetStaticPaths = async () =>
  (await getPublicaciones())
    .filter((p) => p.disponible)
    .map((publicacion) => ({ params: { id: publicacion.id }, props: { publicacion } }));

export const GET: APIRoute = async ({ props }) => {
  const p = (props as { publicacion: Publicacion }).publicacion;
  const png = await generarImagenOg({
    etiqueta: categorias[p.categoria],
    titulo: p.titulo,
    pie: `${p.autor} · ${fechaLegible(p.fecha)}`,
  });
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
