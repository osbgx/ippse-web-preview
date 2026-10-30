// Dibuja los diagramas Mermaid (<div class="mermaid">) de una página, en el navegador.
// La librería se carga del CDN solo si la página tiene diagramas.

import { cdnMermaid } from '../data/visor';

type Mermaid = {
  initialize: (config: Record<string, unknown>) => void;
  run: (opciones?: Record<string, unknown>) => Promise<void>;
};

export async function dibujarDiagramas(contenedor: ParentNode = document) {
  const diagramas = [...contenedor.querySelectorAll<HTMLElement>('.mermaid')];
  if (diagramas.length === 0) return;

  let mermaid: Mermaid;
  try {
    const modulo = (await import(/* @vite-ignore */ cdnMermaid)) as { default?: Mermaid } & Mermaid;
    mermaid = modulo.default ?? modulo;
  } catch {
    // Sin la librería, el código del diagrama queda visible como texto.
    diagramas.forEach((d) => d.classList.add('mermaid-error'));
    return;
  }

  // La línea de "hoy" no aporta en un cronograma proyectado y tapa el primer año
  // del eje: se oculta salvo que el autor la pida explícitamente.
  diagramas.forEach((d) => {
    const texto = d.textContent ?? '';
    if (/^\s*gantt\b/.test(texto) && !/^\s*todayMarker\b/m.test(texto)) {
      d.textContent = texto.replace(/^(\s*gantt\b.*)$/m, '$1\n    todayMarker off');
    }
  });

  // Mermaid mide el Gantt en un contenedor temporal (~300 px) y encima las etiquetas:
  // se le pasa el ancho real, con un mínimo legible (en móvil se desplaza en su recuadro).
  const anchoGantt = Math.max(diagramas[0].clientWidth - 32, 760);

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    fontFamily: 'inherit',
    themeVariables: {
      /* Paleta institucional: rojo/azul de la bandera paraguaya (ver global.css). */
      primaryColor: '#e8eefa',
      primaryBorderColor: '#0038a8',
      primaryTextColor: '#111827',
      lineColor: '#6b7280',
      fontSize: '14px',
      gridColor: '#e5e7eb',
      sectionBkgColor: '#f8fafc',
      altSectionBkgColor: '#ffffff',
      sectionBkgColor2: '#f8fafc',
    },
    gantt: {
      useWidth: anchoGantt,
      leftPadding: 190,
      rightPadding: 140,
      barHeight: 26,
      barGap: 8,
      topPadding: 56,
      fontSize: 13,
      sectionFontSize: 14,
      gridLineStartPadding: 40,
    },
  });

  try {
    await mermaid.run({ nodes: diagramas });
    // Mermaid deja el Gantt con width="100%": se fija su ancho real (ver global.css).
    contenedor.querySelectorAll<SVGSVGElement>('.mermaid svg[aria-roledescription="gantt"]').forEach((svg) => {
      const ancho = svg.viewBox.baseVal?.width;
      if (ancho) svg.style.width = `${ancho}px`;
    });
  } catch (error) {
    console.warn('[diagramas] No se pudo dibujar un diagrama Mermaid', error);
    diagramas.forEach((d) => {
      if (!d.querySelector('svg')) d.classList.add('mermaid-error');
    });
  }
}
