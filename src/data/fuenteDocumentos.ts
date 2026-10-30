// =============================================================================
// FUENTE DE LAS PUBLICACIONES (informes técnicos y ensayos)
// =============================================================================
// Este es el ÚNICO lugar donde se define de dónde sale el contenido de
// /publicaciones/ y del visor de documentos.
//
// El contenido vive en un repositorio aparte, con esta estructura:
//
//   ippse-documentos/
//   ├── contenido/
//   │   └── publicaciones/     <- un .md por informe (cabecera YAML + Markdown)
//   ├── documentos/            <- PDFs oficiales (los declara el campo `pdf`)
//   ├── imagenes/<id>/         <- imágenes de cada informe
//   └── esquema/publicacion.schema.json
//
// >>> PARA CAMBIAR DE REPOSITORIO <<<
// Cambiá SOLO la constante `repoDocumentos` (o definí la variable de entorno
// PUBLIC_DOCS_REPO) y listo: no hay que tocar ninguna página ni componente.
//
//   PUBLIC_DOCS_REPO=usuario/repositorio   (sin https://github.com/)
//
// La rama se toma de PUBLIC_DOCS_RAMA y por defecto es "main".
// =============================================================================

import { commitDocumentos } from './commitDocumentos';

const leer = (valor: string | undefined, porDefecto: string): string =>
  valor && valor.trim() !== '' ? valor.trim() : porDefecto;

/**
 * MODO LOCAL (temporal, para desarrollo):
 * Con `PUBLIC_DOCS_LOCAL=1` el contenido se lee de la carpeta `contenido-local/`
 * del propio proyecto (sincronizada a `public/contenido-local/`), en vez del
 * repositorio de GitHub. Sirve para ver los cambios sin commitear ni esperar
 * al build remoto. Para volver a GitHub, basta con no definir la variable.
 */
export const modoLocal = leer(import.meta.env.PUBLIC_DOCS_LOCAL, '') !== '';

/** Carpeta del proyecto que contiene el contenido en modo local. */
export const carpetaLocal = 'contenido-local';

/** Ruta pública (con base) donde se sirve el contenido local. */
export const rutaPublicaLocal = '/contenido-local';

/** Repositorio de contenido, en formato "usuario/repositorio". */
export const repoDocumentos = leer(import.meta.env.PUBLIC_DOCS_REPO, 'osbgx/ippse-documentos');

/** Rama del repositorio desde la que se lee el contenido. */
export const ramaDocumentos = leer(import.meta.env.PUBLIC_DOCS_RAMA, 'main');

/** Carpeta, dentro del repositorio, que contiene los .md de publicaciones. */
export const carpetaPublicaciones = 'contenido/publicaciones';

/** Carpeta con un .md por término del glosario (/glosario/). */
export const carpetaGlosario = 'contenido/glosario';

/** Carpeta con un .md por pregunta frecuente (/preguntas-frecuentes/). */
export const carpetaPreguntas = 'contenido/preguntas-frecuentes';

/** Carpeta con un .md por comunicado, aparición en medios o evento (/prensa/). */
export const carpetaPrensa = 'contenido/prensa';

/** Carpeta con los documentos institucionales (Constitución, Estatutos, etc.). */
export const carpetaInstitucional = 'contenido/institucional';

/** Carpeta con un .md por gráfico de /datos/ (cifras de los informes en tablas Markdown). */
export const carpetaDatos = 'contenido/datos';

/** Carpeta con un .md por socio que autorizó figurar en el directorio (/socios/). */
export const carpetaSocios = 'contenido/socios';

/** Carpeta con textos de secciones fijas del sitio (cinta de última hora, informe destacado, equipo). */
export const carpetaSitio = 'contenido/sitio';

/** Carpeta, dentro del repositorio, que contiene los PDFs oficiales. */
export const carpetaPdfs = 'documentos';

// -----------------------------------------------------------------------------
// URLs derivadas (no hace falta editarlas)
// -----------------------------------------------------------------------------

/**
 * Referencia que se usa para leer los archivos: el SHA del último commit (fijado
 * en el build) o, si aún no se resolvió, el nombre de la rama.
 */
export const refDocumentos = (): string => commitDocumentos() ?? ramaDocumentos;

/**
 * Base para leer archivos crudos:
 *   · Remoto: https://raw.githubusercontent.com/<repo>/<sha-o-rama>
 *   · Local:  <base del sitio>/contenido-local
 *
 * Es una función (no una constante) porque el SHA recién se conoce cuando corre
 * el loader de publicaciones, antes de renderizar las páginas.
 */
export const baseDocumentos = (): string => {
  if (modoLocal) {
    // Se resuelve con la base del sitio para que funcione igual en /ippse-web/.
    return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${carpetaLocal}`;
  }
  return `https://raw.githubusercontent.com/${repoDocumentos}/${refDocumentos()}`;
};

/** Ruta dentro del repo crudo, p. ej. .../contenido/publicaciones/informe-2-26.md */
export const urlCruda = (rutaEnRepo: string) => `${baseDocumentos()}/${rutaEnRepo}`;

/** Página en GitHub de un archivo (enlace "Ver fuente"). En local no aplica. */
export const urlEnGitHub = (rutaEnRepo: string) =>
  `${baseDocumentos()}/${rutaEnRepo}`;

/**
 * Base del enlace "Ver fuente". En GitHub apunta al visor de archivos del
 * repositorio; en modo local, al propio archivo servido por el sitio.
 */
export const urlBaseFuente = modoLocal
  ? baseDocumentos()
  : `https://github.com/${repoDocumentos}/blob/${ramaDocumentos}`;

/** Página del repositorio en GitHub (en modo local, el contenido propio). */
export const urlRepo = modoLocal ? baseDocumentos() : `https://github.com/${repoDocumentos}`;

/**
 * Resuelve la ruta de un PDF declarada en el frontmatter (`pdf:`), que puede ser:
 *
 *   · Relativa -> vive en el repositorio de contenido, carpeta `documentos/`.
 *     Ej.: `pdf: informe-2-26.pdf` o `pdf: documentos/informe-2-26.pdf`
 *     -> https://raw.githubusercontent.com/<repo>/<rama>/documentos/informe-2-26.pdf
 *
 *   · Absoluta (empieza con "/") -> vive en el propio sitio, bajo public/.
 *     Ej.: `pdf: /documentos/informe-2-26.pdf`
 *     Se devuelve tal cual para que `conBase()` la ajuste al destino.
 *
 * Así el cliente puede subir el PDF junto al .md sin tocar el sitio, y los PDFs
 * que ya están alojados en el sitio siguen funcionando igual.
 */
export const resolverRutaPdf = (valor: string): string => {
  const ruta = valor.trim();
  if (ruta === '') return '';
  if (/^[a-z]+:\/\//i.test(ruta)) return ruta; // ya es una URL completa
  if (ruta.startsWith('/')) return ruta; // absoluta: la maneja el sitio (conBase)

  // Relativa: se asume dentro de `documentos/` del repositorio.
  const limpia = ruta.replace(/^\.\//, '').replace(/^\/+/, '');
  const conCarpeta =
    limpia === carpetaPdfs || limpia.startsWith(`${carpetaPdfs}/`) ? limpia : `${carpetaPdfs}/${limpia}`;
  return urlCruda(conCarpeta);
};

/** URL cruda de un recurso del repositorio (imágenes, PDFs, etc.). */
export const urlRecurso = (rutaEnRepo: string) => urlCruda(rutaEnRepo.replace(/^\.?\//, ''));
