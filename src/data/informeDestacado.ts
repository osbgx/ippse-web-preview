// Datos estructurados del Informe Técnico Nº 2/26 (Parte II — Alternativas de nuevas
// fuentes), tomados de documentos/informe-2-26.md. Aprobado por el Comité Ejecutivo
// del IPPSE en reunión de 14.10.2026.
//
// Se edita en el repositorio de documentos (contenido/sitio/informe-destacado.md);
// estos valores son solo el respaldo si ese archivo falta o tiene errores.

import { informeDestacadoSitio } from './contenidoSitio';

const informeDestacadoPorDefecto = {
  id: 'informe-2-26',
  numero: 'Informe Técnico Nº 2/26',
  parte: 'Parte II — Alternativas de nuevas fuentes',
  /** Fecha de aprobación en formato ISO (AAAA-MM-DD). */
  aprobado: '2026-10-14',
  /** Periodo cubierto por el análisis de riesgo. */
  periodo: '2026–2035',

  bajada:
    'Ante el riesgo de crisis energética por déficit de potencia y energía, el IPPSE evalúa las posibles ' +
    'nuevas fuentes de generación del Paraguay —sus objetivos, factibilidades, costos y cronogramas— ' +
    'para atender los requerimientos del sistema eléctrico nacional.',

  /** Los tres DESAFÍOS fijados en el informe (sección 1, OBJETO). */
  desafios: [
    {
      letra: 'a',
      texto:
        'Superar el “lapso crítico 2028–2030”, cuando deben incorporarse nuevas fuentes de generación ' +
        'para evitar el déficit de potencia y energía a partir de 2031.',
    },
    {
      letra: 'b',
      texto: 'Sustentar los grandes y constantes requerimientos futuros de generación eléctrica del sistema.',
    },
    {
      letra: 'c',
      texto: 'Diversificar la matriz electro-energética para no depender exclusivamente de la hidroelectricidad.',
    },
  ],

  /** Cifras destacadas del resumen ejecutivo y de las conclusiones generales. */
  cifras: [
    {
      valor: '+500 MW/año',
      etiqueta: 'Crecimiento anual de la demanda con el que deberá lidiar el sistema eléctrico nacional',
    },
    {
      valor: '1.500 MW',
      etiqueta: 'Capacidad de interconexión estimada en la CH YACYRETÁ (operación swap con Argentina)',
    },
    {
      valor: '5.000 MW',
      etiqueta: 'Capacidad máxima de inversión de flujo del sistema HVDC de ITAIPU, a negociar con Brasil',
    },
    {
      valor: '1.725 kWh/m²·año',
      etiqueta: 'Densidad de radiación solar: más de 310 días soleados al año en promedio',
    },
  ],

  /**
   * Alternativas del resumen ejecutivo (sección 2) y de las conclusiones (sección 4),
   * ordenadas por plazo de habilitación.
   */
  alternativas: [
    { fuente: 'Centrales solares con bancos de baterías', plazo: '3 a 4 años', horizonte: 'Corto, mediano y largo plazo', firme: false },
    { fuente: 'Interconexión eléctrica con Brasil', plazo: '4 a 5 años', horizonte: 'Corto, mediano y largo plazo', firme: false },
    { fuente: 'Interconexión eléctrica con Argentina', plazo: '4 a 5 años', horizonte: 'Corto, mediano y largo plazo', firme: false },
    { fuente: 'Centrales hidroeléctricas de ríos interiores', plazo: '5 a 6 años c/u', horizonte: 'Complementaria', firme: false },
    { fuente: 'Centrales eólicas', plazo: '5 a 7 años', horizonte: 'Complementaria', firme: false },
    { fuente: 'Centrales termoeléctricas', plazo: '7 a 10 años', horizonte: 'Mediano y largo plazo', firme: true },
    { fuente: 'Centrales hidroeléctricas binacionales', plazo: '10 a 14 años', horizonte: 'Mediano y largo plazo', firme: false },
    { fuente: 'Centrales nucleares (SMR)', plazo: '12 a 15 años', horizonte: 'Mediano y largo plazo', firme: true },
  ],

  /** Reflexión final del informe (sección 5): el cambio de paradigma. */
  paradigma: {
    titulo: 'Cambio de paradigma',
    antes: 'Energía limpia, abundante y barata',
    ahora: 'Energía suficiente, con costos y precios razonables',
    texto:
      'El cercano agotamiento de la capacidad de las actuales fuentes hidroeléctricas (año 2030) y la ' +
      'diversificación necesaria de fuentes, con costos crecientes de la energía producida en forma gradual ' +
      'y continua, conducen al Paraguay a un cambio de paradigma en su abastecimiento eléctrico.',
  },
};
export const informeDestacado = informeDestacadoSitio ?? informeDestacadoPorDefecto;
