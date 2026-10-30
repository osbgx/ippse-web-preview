// Registros extra para el buscador (Pagefind): contenido que no tiene página propia.
//
// Los informes ya tienen su página (/publicaciones/<id>/) y Pagefind los indexa
// solo. Lo que no tiene página son las apariciones en medios sin texto propio:
// se agregan aquí para que el buscador las encuentre y lleve directo a la nota del
// medio. scripts/indexar-busqueda.mjs las suma al índice y borra este archivo de dist/.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { tienePagina, urlEntradaPrensa } from '../data/prensa';

export const GET: APIRoute = async () => {
  const notasExternas = (await getCollection('prensa'))
    .filter((e) => !tienePagina(e) && e.data.tipo === 'aparicion')
    .map((e) => ({
      url: urlEntradaPrensa(e),
      titulo: e.data.titulo,
      contenido: `${e.data.titulo}. ${e.data.tipo === 'aparicion' ? e.data.medio : ''}`,
      seccion: 'Prensa y Novedades',
    }));

  return new Response(JSON.stringify(notasExternas), { headers: { 'Content-Type': 'application/json' } });
};
