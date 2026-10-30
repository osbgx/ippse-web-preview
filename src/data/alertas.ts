// Avisos de la cinta "Última hora". Se editan en el repositorio de documentos
// (contenido/sitio/ultima-hora.md); esta lista es solo el respaldo si ese archivo falta.
import { conBase } from '../lib/rutas';
import { urlVisor } from './publicaciones';
import { alertasSitio } from './contenidoSitio';

export type TipoAlerta = 'Alerta' | 'Informe' | 'Evento' | 'Comunicado';

export interface Alerta {
  tipo: TipoAlerta;
  texto: string;
  href: string;
}

const alertasPorDefecto: Alerta[] = [
  { tipo: 'Informe', texto: 'Informe Técnico Nº 2/26: alternativas de nuevas fuentes de generación', href: urlVisor('informe-2-26') },
  { tipo: 'Alerta', texto: 'Lapso crítico 2028–2030: riesgo de déficit de potencia y energía', href: urlVisor('informe-2-26') },
  { tipo: 'Alerta', texto: 'Déficit de transmisión proyectado para 2028', href: conBase('/prensa/#alerta-deficit-transmision-2028') },
  { tipo: 'Informe', texto: 'Balance oferta-demanda del SIN actualizado', href: conBase('/publicaciones/') },
  { tipo: 'Evento', texto: 'Foro técnico sobre diversificación de la matriz energética', href: conBase('/prensa/#eventos') },
  { tipo: 'Comunicado', texto: 'Posición del IPPSE sobre el Plan Maestro de Generación', href: conBase('/prensa/#posicion-plan-maestro') },
];

export const alertas: Alerta[] = alertasSitio ?? alertasPorDefecto;
