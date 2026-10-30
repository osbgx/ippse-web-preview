// Informa los archivos de contenido que se omitieron por errores (ver
// src/lib/errores-contenido.ts) como un issue en el repositorio de documentos.
//
// - Hay errores y no hay issue abierto  -> abre uno (GitHub avisa por email).
// - Hay errores y ya hay uno abierto    -> lo actualiza con la lista vigente.
// - No hay errores y hay uno abierto    -> lo cierra: el contenido ya se publicó.
//
// Necesita DOCS_ISSUES_TOKEN: token fino con permiso "Issues: Read and write" SOLO
// sobre el repositorio de documentos. Sin token, solo muestra los errores en el log.
// Corre en el workflow después del build (.github/workflows/publicar.yml).

import { readFile, appendFile } from 'node:fs/promises';

const ETIQUETA = 'contenido-con-errores';
const repo = process.env.PUBLIC_DOCS_REPO || 'osbgx/ippse-documentos';
const token = process.env.DOCS_ISSUES_TOKEN;

let errores = [];
try {
  errores = JSON.parse(await readFile('contenido-errores.json', 'utf8'));
} catch {
  errores = [];
}

const cuerpo = [
  'El sitio web se actualizó, pero **estos archivos no se publicaron** porque tienen errores en su',
  'cabecera (la parte entre `---` al principio del archivo). Corregilos y guardá: la web se',
  'actualiza sola y este aviso se cierra automáticamente.',
  '',
  '| Archivo | Qué hay que corregir |',
  '|---|---|',
  ...errores.map((e) => `| [\`${e.archivo}\`](../blob/main/${e.archivo}) | ${e.detalle.replace(/\|/g, '\\|')} |`),
  '',
  'Los campos válidos de cada tipo de archivo están en el `README.md` del repositorio.',
].join('\n');

// Resumen visible en la ejecución del workflow (Actions).
if (process.env.GITHUB_STEP_SUMMARY) {
  await appendFile(
    process.env.GITHUB_STEP_SUMMARY,
    errores.length ? `## Contenido omitido por errores\n\n${cuerpo}\n` : '## Contenido: sin errores\n',
  );
}

if (errores.length) {
  console.log(`[contenido] ${errores.length} archivo(s) omitidos:`);
  errores.forEach((e) => console.log(`  - ${e.archivo}: ${e.detalle}`));
} else {
  console.log('[contenido] Sin errores.');
}

if (!token) {
  console.log('[contenido] Sin DOCS_ISSUES_TOKEN: no se abre ni cierra el aviso en GitHub.');
  process.exit(0);
}

const api = async (ruta, opciones = {}) => {
  const r = await fetch(`https://api.github.com/repos/${repo}${ruta}`, {
    ...opciones,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'ippse-web-build',
      ...(opciones.body && { 'Content-Type': 'application/json' }),
    },
  });
  if (!r.ok) throw new Error(`GitHub ${ruta}: HTTP ${r.status} ${await r.text()}`);
  return r.status === 204 ? null : r.json();
};

try {
  const [abierto] = await api(`/issues?state=open&labels=${ETIQUETA}&per_page=1`);

  if (errores.length && !abierto) {
    const nuevo = await api('/issues', {
      method: 'POST',
      body: JSON.stringify({ title: 'Archivos de contenido con errores (no publicados)', body: cuerpo, labels: [ETIQUETA] }),
    });
    console.log(`[contenido] Aviso abierto: ${nuevo.html_url}`);
  } else if (errores.length && abierto) {
    await api(`/issues/${abierto.number}`, { method: 'PATCH', body: JSON.stringify({ body: cuerpo }) });
    console.log(`[contenido] Aviso actualizado: ${abierto.html_url}`);
  } else if (!errores.length && abierto) {
    await api(`/issues/${abierto.number}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body: 'Todo el contenido se publicó correctamente. Se cierra este aviso.' }),
    });
    await api(`/issues/${abierto.number}`, { method: 'PATCH', body: JSON.stringify({ state: 'closed' }) });
    console.log(`[contenido] Aviso cerrado: ${abierto.html_url}`);
  }
} catch (error) {
  // El aviso es informativo: si falla, no se frena la publicación.
  console.warn(`[contenido] No se pudo gestionar el aviso en GitHub: ${error.message}`);
}
