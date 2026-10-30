// Preparación del Markdown del repositorio de contenido antes de renderizarlo.
// Se aplica a todos los archivos que carga el loader (cargador-publicaciones.ts).

/**
 * - Quita artefactos de transcripción ([cite_start], [cite: 12]).
 * - Quita las líneas de portada que ya muestra la página (aprobación, nombre del
 *   Instituto), igual que hacía el visor.
 * - Escapa "US$": es moneda, nunca el inicio de una fórmula (si no, "US$ 5.000 …
 *   US$/kW" se interpretaría como una fórmula entre los dos signos).
 */
export const prepararMarkdown = (md: string) =>
  md
    .replace(/\s?\[cite(?:_start|:[^\]]*)\]/g, '')
    .replace(/^\*?Aprobado en Reunión del Comité Ejecutivo del IPPSE[^\n]*$/gm, '')
    .replace(/^\*{0,2}Instituto de Profesionales Paraguayos del Sector Eléctrico\*{0,2}[ \t]*$/gm, '')
    .replace(/(?<!\\)\bUS\$/g, 'US\\$')
    .replace(/\n{3,}/g, '\n\n');
