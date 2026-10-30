// Genera el índice del buscador (Pagefind) sobre dist/, después de `astro build`.
//
//   1. Indexa el contenido principal de cada página (marcado con data-pagefind-body).
//   2. Agrega el texto completo de los informes (dist/busqueda-informes.json), que
//      el visor carga en el navegador y por eso no está en el HTML.
//   3. Escribe el índice en dist/pagefind/ y borra el JSON auxiliar.
//
// Se ejecuta solo con `npm run build` (script "postbuild" de package.json).

import { readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import * as pagefind from 'pagefind';

const dist = path.resolve(process.cwd(), process.argv[2] ?? 'dist');
const auxiliar = path.join(dist, 'busqueda-informes.json');

const { index, errors } = await pagefind.createIndex({ forceLanguage: 'es' });
if (!index) throw new Error(`Pagefind no pudo iniciar: ${errors.join(', ')}`);

const { page_count } = await index.addDirectory({ path: dist });

let informes = [];
try {
  informes = JSON.parse(await readFile(auxiliar, 'utf8'));
} catch {
  console.warn('[buscador] No se encontró busqueda-informes.json: los informes se indexan solo por su tarjeta.');
}

// Las URL del JSON ya traen el base del sitio (p. ej. /ippse-web/visor/?doc=…).
for (const informe of informes) {
  await index.addCustomRecord({
    url: informe.url,
    content: informe.contenido,
    language: 'es',
    meta: { title: informe.titulo },
    filters: { sección: [informe.seccion ?? 'Informes y Publicaciones'] },
  });
}

await index.writeFiles({ outputPath: path.join(dist, 'pagefind') });
await rm(auxiliar, { force: true });
await pagefind.close();

console.log(`[buscador] Índice generado: ${page_count} páginas + ${informes.length} notas en medios sin página propia.`);
