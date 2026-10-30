// Completa dist/.htaccess con valores que dependen del entorno del build.
//
//   __UMAMI_ORIGEN__ -> origen del servidor de Umami (de PUBLIC_UMAMI_SRC) para que la
//                       Content-Security-Policy permita su script. Sin Umami, se quita.
//
// Corre en "postbuild" (package.json). Recibe la carpeta de salida como argumento opcional.

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve(process.cwd(), process.argv[2] ?? 'dist');
const archivo = path.join(dist, '.htaccess');

let origenUmami = '';
const src = (process.env.PUBLIC_UMAMI_SRC ?? '').trim();
if (src) {
  try {
    origenUmami = new URL(src).origin;
  } catch {
    console.warn(`[htaccess] PUBLIC_UMAMI_SRC no es una URL válida: ${src}`);
  }
}

try {
  const contenido = await readFile(archivo, 'utf8');
  await writeFile(archivo, contenido.replaceAll(' __UMAMI_ORIGEN__', origenUmami ? ` ${origenUmami}` : ''));
  console.log(`[htaccess] CSP ajustada${origenUmami ? ` (Umami: ${origenUmami})` : ' (sin Umami)'}.`);
} catch (error) {
  console.warn(`[htaccess] No se pudo ajustar ${archivo}: ${error.message}`);
}
