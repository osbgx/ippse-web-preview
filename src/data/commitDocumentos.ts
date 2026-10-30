// Referencia (commit) del repositorio de contenido.
//
// El visor y las páginas descargan los archivos desde raw.githubusercontent.com,
// que pasa por una CDN con caché de varios minutos: si se publica un informe y el
// sitio sigue apuntando a la rama, el documento nuevo puede verse desactualizado
// un rato.
//
// Para evitarlo, el build fija el SHA del último commit del repositorio de
// contenido y todas las URLs usan ese SHA en lugar del nombre de la rama. Las
// URLs con SHA son inmutables: la CDN las cachea indefinidamente y siempre
// devuelven el contenido correcto. Cuando cambia el repositorio, el sitio se
// regenera con el SHA nuevo.
//
// El SHA lo resuelve el loader de publicaciones (`cargador-publicaciones.ts`),
// que corre antes que las páginas durante el build. Si por algún motivo no se
// pudo resolver (por ejemplo, el contenido vino de la caché de Astro y el loader
// no corrió), se cae con elegancia al nombre de la rama.

/** SHA del último commit del repositorio de contenido, o null si aún no se resolvió. */
let commitActual: string | null = null;

/**
 * Guarda el SHA del commit que se está usando. Lo llama el loader de
 * publicaciones durante el build, una sola vez.
 *
 * Se guarda también en `globalThis` porque Astro carga el loader de contenido y
 * las páginas en grafos de módulos separados: una variable local no se comparte
 * entre ambos, pero el objeto global del proceso de build sí.
 */
const CLAVE_GLOBAL = '__ippseCommitDocumentos';

export const fijarCommitDocumentos = (sha: string): void => {
  const limpio = sha.trim();
  if (limpio === '') return;
  commitActual = limpio;
  (globalThis as Record<string, unknown>)[CLAVE_GLOBAL] = limpio;
};

/** SHA fijado en el build, o null si todavía no se resolvió. */
export const commitDocumentos = (): string | null => {
  const enGlobal = (globalThis as Record<string, unknown>)[CLAVE_GLOBAL];
  if (typeof enGlobal === 'string' && enGlobal !== '') return enGlobal;
  return commitActual;
};
