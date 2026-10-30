// Verificaciones automáticas sobre el sitio ya compilado (dist/):
//
//   1. Enlaces internos rotos: cada href/src interno debe existir, y cada #ancla
//      tiene que estar en la página de destino.
//   2. HTML válido: html-validate con reglas de estructura (ids duplicados,
//      anidamiento inválido, atributos repetidos…).
//   3. Accesibilidad: axe-core en un navegador, sobre una página de cada tipo.
//      Fallan las violaciones "serious" y "critical".
//
// Uso:  node scripts/verificar-sitio.mjs [carpeta-dist]
// Sale con código 1 si hay errores. En el workflow corre después del build.
// Navegador: CHROME_PATH, o Chrome/Edge en la ubicación habitual.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const dist = path.resolve(process.cwd(), process.argv[2] ?? 'dist');
const base = (process.env.DEPLOY_TARGET === 'pages' ? '/ippse-web' : '').replace(/\/$/, '');
let errores = 0;
const informar = (titulo, lineas) => {
  if (!lineas.length) return console.log(`✔ ${titulo}`);
  errores += lineas.length;
  console.log(`✘ ${titulo} (${lineas.length})`);
  lineas.slice(0, 50).forEach((l) => console.log(`   - ${l}`));
};

// --- Páginas HTML de dist ------------------------------------------------------
const paginas = [];
const recorrer = (dir) => {
  for (const nombre of readdirSync(dir)) {
    const ruta = path.join(dir, nombre);
    if (statSync(ruta).isDirectory()) {
      if (!['_astro', 'pagefind', 'contenido-local'].includes(nombre)) recorrer(ruta);
    } else if (nombre.endsWith('.html')) paginas.push(ruta);
  }
};
recorrer(dist);

const urlDe = (archivo) => {
  const rel = path.relative(dist, archivo).split(path.sep).join('/');
  return `/${rel.replace(/index\.html$/, '')}`;
};
const html = new Map(paginas.map((p) => [urlDe(p), readFileSync(p, 'utf8')]));
const ids = new Map([...html].map(([url, h]) => [url, new Set([...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]));

// --- 1. Enlaces internos -----------------------------------------------------
const rotos = [];
const existe = (ruta) => {
  const sinBase = base && ruta.startsWith(base) ? ruta.slice(base.length) || '/' : ruta;
  const archivo = path.join(dist, decodeURIComponent(sinBase));
  if (sinBase.endsWith('/')) return existsSync(path.join(archivo, 'index.html')) ? sinBase : null;
  if (existsSync(archivo) && statSync(archivo).isFile()) return sinBase;
  if (existsSync(path.join(archivo, 'index.html'))) return `${sinBase}/`;
  return null;
};
for (const [url, h] of html) {
  for (const [, , destino] of h.matchAll(/\s(href|src)="([^"]+)"/g)) {
    if (/^(?:[a-z]+:|\/\/|data:)/i.test(destino)) continue; // externos, mailto, tel, data
    // Archivos que se generan después de esta verificación o que sirve el servidor.
    if (/\/(pagefind|_astro)\//.test(destino) || /\.php(\?|$)/.test(destino)) continue;
    const [ruta, ancla] = destino.split('#');
    if (ruta === '' && ancla) {
      if (!ids.get(url)?.has(decodeURIComponent(ancla))) rotos.push(`${url} → #${ancla} (ancla inexistente)`);
      continue;
    }
    if (!ruta.startsWith('/')) continue; // relativas: no se usan en el sitio
    const sinConsulta = ruta.split('?')[0];
    const pagina = existe(sinConsulta);
    if (!pagina) {
      rotos.push(`${url} → ${destino}`);
      continue;
    }
    if (ancla && html.has(pagina) && !ids.get(pagina)?.has(decodeURIComponent(ancla))) {
      rotos.push(`${url} → ${destino} (ancla inexistente)`);
    }
  }
}
informar('Enlaces internos', [...new Set(rotos)]);

// --- 2. HTML válido ------------------------------------------------------------
const { HtmlValidate } = await import('html-validate');
const validador = new HtmlValidate({
  extends: ['html-validate:document'],
  rules: {
    'no-dup-id': 'error',
    'no-dup-attr': 'error',
    'element-permitted-content': 'error',
    'element-permitted-parent': 'error',
    'close-order': 'error',
    'unique-landmark': 'off',
    // No hay hojas de estilo ni scripts de terceros con <link>: SRI no aplica.
    'require-sri': 'off',
  },
});
const invalidos = [];
for (const [url, h] of html) {
  const reporte = await validador.validateString(h);
  for (const r of reporte.results) {
    for (const m of r.messages) invalidos.push(`${url} línea ${m.line}: ${m.message} [${m.ruleId}]`);
  }
}
informar('HTML válido', invalidos);

// --- 3. Accesibilidad (axe) ----------------------------------------------------
const navegador = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((r) => r && existsSync(r));

if (!navegador) {
  console.log('… Accesibilidad: no se encontró Chrome/Edge (definí CHROME_PATH). Se omite.');
} else {
  // Una página de cada tipo (plantilla), no las 100+: el resultado es el mismo.
  const muestra = [
    '/', '/nosotros/', '/institucional/', '/publicaciones/', '/prensa/', '/contacto/', '/datos/', '/socios/',
    '/glosario/', '/preguntas-frecuentes/', '/prensa/kit/', '/privacidad/', '/buscar/',
    [...html.keys()].find((u) => /^\/publicaciones\/[^/]+\/$/.test(u)),
    [...html.keys()].find((u) => /^\/prensa\/(?!kit\/)[^/]+\/$/.test(u)),
  ].filter((u) => u && html.has(u));

  const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json' };
  const servidor = createServer((req, res) => {
    let ruta = decodeURIComponent((req.url ?? '/').split('?')[0]);
    if (base && ruta.startsWith(base)) ruta = ruta.slice(base.length) || '/';
    let archivo = path.join(dist, ruta);
    if (existsSync(archivo) && statSync(archivo).isDirectory()) archivo = path.join(archivo, 'index.html');
    if (!existsSync(archivo)) return res.writeHead(404).end();
    res.writeHead(200, { 'Content-Type': tipos[path.extname(archivo)] ?? 'application/octet-stream' }).end(readFileSync(archivo));
  }).listen(0);
  const puerto = servidor.address().port;

  const puppeteer = (await import('puppeteer-core')).default;
  const b = await puppeteer.launch({ executablePath: navegador, headless: true, args: ['--no-sandbox'] });
  const axe = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
  const fallas = [];
  for (const url of muestra) {
    const p = await b.newPage();
    await p.setViewport({ width: 1280, height: 900 });
    // Sin recursos externos (CDN, GitHub): se evalúa el HTML del sitio.
    await p.setRequestInterception(true);
    p.on('request', (r) => (r.url().startsWith(`http://localhost:${puerto}`) ? r.continue() : r.abort()));
    await p.goto(`http://localhost:${puerto}${base}${url}`, { waitUntil: 'load' });
    await p.addScriptTag({ content: axe });
    const resultado = await p.evaluate(async () =>
      // @ts-ignore axe se inyecta arriba
      (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => `${v.id}: ${v.help} (${v.nodes.length} elemento/s, p. ej. ${v.nodes[0]?.target?.join(' ')})`),
    );
    resultado.forEach((r) => fallas.push(`${url} ${r}`));
    await p.close();
  }
  await b.close();
  servidor.close();
  informar(`Accesibilidad (${muestra.length} páginas)`, fallas);
}

if (errores) {
  console.log(`\n${errores} problema(s).`);
  process.exit(1);
}
console.log('\nTodo en orden.');
