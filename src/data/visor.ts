// Librerías que se cargan por CDN en el navegador, con versión exacta fijada.
//
// Los informes se generan como HTML en el build (fórmulas con KaTeX incluidas);
// solo los diagramas Mermaid se dibujan en el navegador, y la librería se carga
// únicamente en las páginas que tienen diagramas (src/lib/mermaid-cliente.ts).
// Para actualizar la versión se cambia acá (y el origen ya está permitido en la CSP).

/** Diagramas (flowchart, gantt, secuencia…) escritos en bloques ```mermaid */
export const cdnMermaid = 'https://cdn.jsdelivr.net/npm/mermaid@12.2.0/dist/mermaid.esm.min.mjs';
