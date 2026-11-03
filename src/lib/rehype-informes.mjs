/**
 * Ajustes del HTML de los documentos del repositorio de contenido (se aplica a
 * todo el Markdown del sitio, en el build). Reemplaza lo que antes hacía el visor
 * en el navegador:
 *
 *   - Un solo <h1> por página: los H1 del documento bajan a H2.
 *   - Tablas anchas: se envuelven en un contenedor desplazable (no rompen el ancho en móvil).
 *   - Enlaces externos (http…): se abren en pestaña nueva.
 *   - Diagramas: los bloques ```mermaid pasan a <div class="mermaid"> con el texto
 *     crudo; el navegador los dibuja (src/lib/mermaid-cliente.ts).
 *
 * Las rutas relativas a imágenes y documentos del repositorio se resuelven en la
 * página (resolverRutasRepo), porque dependen del commit fijado en el build.
 */

const texto = (nodo) =>
  nodo.type === 'text' ? nodo.value : (nodo.children ?? []).map(texto).join('');

const elementos = (nodo, tag) =>
  (nodo.children ?? []).flatMap((c) =>
    c.type !== 'element' ? [] : c.tagName === tag ? [c] : elementos(c, tag),
  );

const agregarClase = (nodo, clase) => {
  nodo.properties ??= {};
  const actuales = nodo.properties.className ?? [];
  nodo.properties.className = [...(Array.isArray(actuales) ? actuales : [actuales]), clase];
};

/**
 * Colores de los informes sin HTML en el Markdown (el repositorio queda legible para el RAG):
 *   - Fila que menciona "ALERTA ROJA" / "ALERTA NARANJA": fondo rojo / naranja claro.
 *   - Celda numérica negativa ("- 566", "-1.236"): déficit, en rojo.
 */
const marcarAlertas = (tabla) => {
  for (const fila of elementos(tabla, 'tr')) {
    const contenido = texto(fila).toUpperCase();
    if (contenido.includes('ALERTA ROJA')) agregarClase(fila, 'fila-alerta-roja');
    else if (contenido.includes('ALERTA NARANJA')) agregarClase(fila, 'fila-alerta-naranja');
    for (const celda of elementos(fila, 'td')) {
      if (/^\s*[-−–]\s*\d/.test(texto(celda))) agregarClase(celda, 'valor-deficit');
    }
  }
};

export default function rehypeInformes() {
  return (arbol) => {
    const recorrer = (padre) => {
      const hijos = padre.children ?? [];
      for (let i = 0; i < hijos.length; i++) {
        const nodo = hijos[i];
        if (nodo.type !== 'element') continue;

        if (nodo.tagName === 'h1') nodo.tagName = 'h2';

        // ```mermaid -> <div class="mermaid">texto</div>
        if (nodo.tagName === 'pre') {
          const code = nodo.children?.find((c) => c.type === 'element' && c.tagName === 'code');
          const clases = code?.properties?.className ?? [];
          const lenguaje = nodo.properties?.dataLanguage ?? '';
          if (lenguaje === 'mermaid' || (Array.isArray(clases) && clases.includes('language-mermaid'))) {
            hijos[i] = {
              type: 'element',
              tagName: 'div',
              properties: { className: ['mermaid'] },
              children: [{ type: 'text', value: texto(code ?? nodo) }],
            };
            continue;
          }
        }

        if (nodo.tagName === 'table') {
          marcarAlertas(nodo);
          hijos[i] = {
            type: 'element',
            tagName: 'div',
            properties: {
              className: ['tabla-desplazable'],
              tabIndex: 0,
              role: 'region',
              ariaLabel: 'Tabla (desplazable horizontalmente)',
            },
            children: [nodo],
          };
          continue;
        }

        if (nodo.tagName === 'a' && /^https?:/i.test(String(nodo.properties?.href ?? ''))) {
          nodo.properties.target = '_blank';
          nodo.properties.rel = ['noopener', 'noreferrer'];
        }

        recorrer(nodo);
      }
    };
    recorrer(arbol);
  };
}
