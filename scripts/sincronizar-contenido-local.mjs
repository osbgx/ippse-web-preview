// Sincroniza la carpeta de contenido local a `public/` para el MODO LOCAL.
//
// Con `PUBLIC_DOCS_LOCAL=1`, el visor y el índice leen las publicaciones desde
// `contenido-local/` (ver src/data/fuenteDocumentos.ts). Como el sitio es
// estático, esos archivos tienen que servirse como archivos públicos: este
// script copia `contenido-local/` a `public/contenido-local/`.
//
// Se ejecuta automáticamente antes de `dev` y `build` (ver package.json), así
// no hace falta commitear al repositorio de contenido para ver los cambios.
//
// Si el modo local está desactivado, no hace nada (y limpia la copia previa).

import { cp, rm, access } from 'node:fs/promises';
import path from 'node:path';

const activo = (process.env.PUBLIC_DOCS_LOCAL ?? '').trim() !== '';
const origen = path.resolve(process.cwd(), 'contenido-local');
const destino = path.resolve(process.cwd(), 'public', 'contenido-local');

if (!activo) {
  // Sin modo local: no se sirve ninguna copia (evita subir contenido de prueba).
  await rm(destino, { recursive: true, force: true });
  console.log('[contenido-local] Modo local desactivado: no se sincroniza nada.');
  process.exit(0);
}

try {
  await access(origen);
} catch {
  console.error(`[contenido-local] No existe la carpeta de origen: ${origen}`);
  process.exit(1);
}

await rm(destino, { recursive: true, force: true });
await cp(origen, destino, {
  recursive: true,
  // El .git interno del contenido no tiene sentido en el sitio.
  filter: (origenArchivo) => !origenArchivo.split(path.sep).includes('.git'),
});
console.log(`[contenido-local] Sincronizado: ${origen} -> ${destino}`);
