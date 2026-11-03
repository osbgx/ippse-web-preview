// Textos institucionales: copiados literalmente del sitio original del IPPSE. Editar libremente.

import { conBase } from '../lib/rutas';
import { citaPresidenteSitio, equipoSitio } from './contenidoSitio';
export const fundacion = '23 de abril de 1993';

export const lema = 'Promoviendo la soberanía, la seguridad y la sostenibilidad energética de Paraguay.';

export const descripcionCorta =
  'Asociación civil técnica e independiente dedicada al estudio, análisis y desarrollo de propuestas ' +
  'estratégicas para el fortalecimiento del sector eléctrico nacional.';

export const presentacionHero = `${lema} Somos una asociación civil técnica e independiente dedicada al estudio, ` +
  'análisis y desarrollo de propuestas estratégicas para el fortalecimiento del sector eléctrico nacional.';

export const quienesSomos = {
  titulo: 'El puente entre la experiencia técnica y las políticas de Estado',
  parrafos: [
    'El IPPSE reúne al talento técnico y profesional más calificado de la ingeniería y el sector eléctrico paraguayo. ' +
      'Ante el crecimiento acelerado de la demanda energética y los desafíos de transmisión, distribución y generación, ' +
      'el instituto actúa como un puente entre la experiencia técnica, la opinión pública y las políticas de Estado.',
  ],
};

// Página Nosotros (textos literales del sitio original)
export const historia = {
  titulo: 'Talento técnico al servicio del sector eléctrico paraguayo',
  parrafos: [
    quienesSomos.parrafos[0],
    'Somos una asociación civil técnica e independiente, dedicada al estudio, análisis y desarrollo de propuestas ' +
      'estratégicas para el fortalecimiento del sector eléctrico nacional. Nuestro trabajo se fundamenta en el rigor ' +
      'científico, la prospectiva energética y el compromiso con la soberanía energética de Paraguay.',
  ],
};

export const mision =
  'Fomentar el desarrollo sostenible y eficiente del sistema eléctrico paraguayo mediante el análisis riguroso, ' +
  'la investigación aplicada, el debate especializado y la formulación de recomendaciones estratégicas para la ' +
  'política energética nacional.';

export const vision =
  'Ser el organismo civil de referencia técnica y científica en materia energética en Paraguay, impulsando la ' +
  'planificación a largo plazo, la diversificación de la matriz eléctrica y la soberanía energética.';

export const valores = [
  { titulo: 'Independencia', descripcion: 'Análisis técnico libre de condicionamientos políticos o comerciales.' },
  { titulo: 'Rigor Técnico', descripcion: 'Investigación aplicada basada en datos y evidencia comprobable.' },
  { titulo: 'Colaboración', descripcion: 'Convergencia del talento profesional más calificado del país.' },
];

// Equipo y cita del presidente: se editan en el repositorio de documentos
// (contenido/sitio/equipo.md). Estos valores son solo el respaldo.
const equipoPorDefecto = [
  {
    nombre: 'Ing. Ángel María Recalde',
    rol: 'Presidente · Referente del sector eléctrico',
    bio: 'Ingeniero eléctrico con décadas de experiencia en planificación y gestión del sistema energético nacional.',
  },
  {
    nombre: 'Comisión Directiva',
    rol: 'Equipo técnico multidisciplinario',
    bio: 'Profesionales de la ingeniería, economía y derecho energético que conforman el cuerpo directivo del IPPSE.',
  },
  {
    nombre: 'Comité Técnico Asesor',
    rol: 'Especialistas en generación, transmisión y distribución',
    bio: 'Grupo de expertos encargado de la elaboración de diagnósticos, informes y propuestas técnicas.',
  },
];

export const equipo = equipoSitio ?? equipoPorDefecto;

/**
 * Foto oficial del presidente para el kit de prensa: ruta en public/ (p. ej.
 * '/prensa/presidente.jpg'). Mientras sea undefined, el kit la ofrece a pedido.
 */
export const fotoPresidente: string | undefined = undefined;

export const citaPresidente = citaPresidenteSitio ?? {
  texto:
    'La soberanía energética de Paraguay se construye con planificación a largo plazo, rigor técnico y la ' +
    'convergencia del talento profesional del sector.',
  autor: 'Ing. Ángel María Recalde, Presidente del IPPSE',
};

export interface Eje {
  titulo: string;
  descripcion: string;
  /** Nombre del icono en el icon pack (prefijo `lucide:`), p. ej. "lucide:chart-line". */
  icono: string;
}

export const ejesEstrategicos: Eje[] = [
  {
    titulo: 'Planificación Estratégica y Prospectiva',
    descripcion: 'Monitoreo y evaluación constante del balance entre oferta y demanda eléctrica.',
    icono: 'lucide:chart-line',
  },
  {
    titulo: 'Diversificación de la Matriz Energética',
    descripcion: 'Promoción de energías renovables (solar, eólica, biomasa) y soluciones complementarias a la hidroelectricidad.',
    icono: 'lucide:sun',
  },
  {
    titulo: 'Fortalecimiento Institucional',
    descripcion: 'Impulso a proyectos legislativos, creación de un Ministerio de Energía y agilización de Planes Maestros.',
    icono: 'lucide:landmark',
  },
  {
    titulo: 'Divulgación y Capacitación',
    descripcion: 'Foros, seminarios técnicos e informes de alerta temprana sobre el sistema eléctrico.',
    icono: 'lucide:graduation-cap',
  },
];

export interface EnlaceRapido {
  titulo: string;
  descripcion: string;
  href: string;
  /** true si el destino es un archivo (PDF): se abre en pestaña nueva. */
  archivo?: boolean;
}

export const enlacesRapidos: EnlaceRapido[] = [
  { titulo: 'Informes técnicos', descripcion: 'Diagnósticos, propuestas y ensayos del IPPSE.', href: conBase('/publicaciones/') },
  { titulo: 'Constitución', descripcion: 'Documento fundacional del Instituto.', href: conBase('/institucional/#constitución') },
  { titulo: 'Estatutos', descripcion: 'Organización, autoridades y membresía.', href: conBase('/institucional/#estatutos') },
  { titulo: 'Código de Ética', descripcion: 'Principios de conducta de los miembros.', href: conBase('/institucional/#código-de-ética') },
];
