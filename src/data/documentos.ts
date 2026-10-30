// Documentos en PDF alojados en el propio sitio (public/documentos/).
// Cada archivo se copia al build, así que el enlace funciona sin pasos manuales.

import { conBase } from '../lib/rutas';
export interface DocumentoPdf {
  /** Ruta pública del archivo dentro del sitio. */
  href: string;
  titulo: string;
  /** Peso aproximado, en MB, para orientar al usuario antes de abrirlo. */
  peso: string;
}

/** Acta de Constitución del IPPSE. */
export const pdfConstitucion: DocumentoPdf = {
  href: conBase('/documentos/constitucion-ippse.pdf'),
  titulo: 'Constitución del IPPSE — Acta fundacional',
  peso: '5,7 MB',
};

export interface DescargaInstitucional {
  documento: string;
  /** Ancla de la sección en /institucional/ (versión en texto). */
  ancla: string;
  /** Ruta dentro de public/ (sin base): el tamaño se calcula en el build. */
  ruta: string;
  /** Fecha que consta en el documento original. */
  fecha: string;
  paginas: number;
}

/**
 * Centro de descargas (/institucional/#descargas): un PDF oficial por documento,
 * separado de la copia escaneada completa. Versión: original escaneado.
 */
export const descargasInstitucionales: DescargaInstitucional[] = [
  { documento: 'Constitución', ancla: 'constitución', ruta: '/documentos/institucional/constitucion.pdf', fecha: 'Comité Ejecutivo 1995/1996', paginas: 4 },
  { documento: 'Acta de constitución', ancla: 'acta-de-constitución', ruta: '/documentos/institucional/acta-de-constitucion.pdf', fecha: '23 de abril de 1993', paginas: 4 },
  { documento: 'Estatutos', ancla: 'estatutos', ruta: '/documentos/institucional/estatutos.pdf', fecha: '23 de abril de 1993', paginas: 8 },
  { documento: 'Reglamento Interno', ancla: 'reglamento-interno', ruta: '/documentos/institucional/reglamento-interno.pdf', fecha: '24 de mayo de 1996', paginas: 7 },
  { documento: 'Código de Ética', ancla: 'código-de-ética', ruta: '/documentos/institucional/codigo-de-etica.pdf', fecha: 'Sin fecha en el original', paginas: 3 },
];

/** Informe Técnico Nº 2/26 (Parte II). */
export const pdfInforme226: DocumentoPdf = {
  href: conBase('/documentos/informe-2-26.pdf'),
  titulo: 'Informe Técnico Nº 2/26 — Parte II',
  peso: '690 KB',
};
