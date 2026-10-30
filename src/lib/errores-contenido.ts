// Errores en el contenido del repositorio de documentos.
//
// Si un .md tiene la cabecera mal escrita (un campo obligatorio vacío, una fecha
// con otro formato, una categoría que no existe…), el loader lo OMITE y sigue con
// el resto: la web se actualiza igual. El error se anota aquí y, al terminar el
// build, scripts/reportar-errores-contenido.mjs lo informa como un issue en el
// repositorio de documentos (GitHub avisa por email a quien lo administra).
//
// Los errores se guardan en un archivo (contenido-errores.json, en la raíz del
// proyecto y fuera de dist/) porque cada colección se carga por separado y el
// reporte corre en otro proceso. Se vacía al iniciar cada build ("prebuild" en package.json).

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const archivoErrores = path.resolve(process.cwd(), 'contenido-errores.json');

export interface ErrorContenido {
  /** Ruta dentro del repositorio de documentos, p. ej. contenido/prensa/foro.md */
  archivo: string;
  /** Explicación en lenguaje claro. */
  detalle: string;
}

export const vaciarErroresContenido = () => writeFileSync(archivoErrores, '[]');

export const registrarErrorContenido = (error: ErrorContenido) => {
  let lista: ErrorContenido[] = [];
  try {
    if (existsSync(archivoErrores)) lista = JSON.parse(readFileSync(archivoErrores, 'utf8'));
  } catch {
    lista = [];
  }
  // Un mismo archivo se informa una sola vez por build.
  if (!lista.some((e) => e.archivo === error.archivo)) lista.push(error);
  writeFileSync(archivoErrores, JSON.stringify(lista, null, 2));
};

/**
 * Convierte el error de validación de Astro/Zod en frases que entienda quien
 * escribió el archivo: "Campo «fecha»: Usar AAAA-MM-DD o AAAA-MM".
 */
export const explicarError = (error: unknown): string => {
  const texto = error instanceof Error ? error.message : String(error);
  // Astro lista cada problema en su línea: "  **campo**: **campo**: Mensaje".
  const problemas = [...texto.matchAll(/^\s*\*\*([\w.]+)\*\*:\s*(?:\*\*[\w.]+\*\*:\s*)?(.+)$/gm)].map(
    ([, campo, mensaje]) => `Campo «${campo}»: ${traducir(mensaje.trim())}`,
  );
  return problemas.length > 0 ? problemas.join(' · ') : texto.split('\n')[0].slice(0, 300);
};

/** Mensajes de Zod más comunes, en castellano. */
const traducir = (mensaje: string) =>
  mensaje
    .replace(/^Required$/i, 'es obligatorio y falta.')
    .replace(/^Expected (\w+), received (\w+)$/i, 'tiene un valor de tipo incorrecto ($2 en lugar de $1).')
    .replace(/^Invalid enum value\. Expected (.+), received (.+)$/i, 'el valor $2 no es válido; opciones: $1.')
    .replace(/^Invalid literal value, expected (.+)$/i, 'debe ser $1.')
    .replace(/^String must contain at least (\d+) character\(s\)$/i, 'debe tener al menos $1 caracteres.')
    .replace(/^String must contain at most (\d+) character\(s\)$/i, 'puede tener como máximo $1 caracteres.');

// Para que el archivo exista aunque no haya errores (el reporte lo lee siempre).
export const asegurarArchivoErrores = () => {
  if (!existsSync(archivoErrores)) vaciarErroresContenido();
};
