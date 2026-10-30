import { conBase } from '../lib/rutas';

export interface EnlaceNav {
  etiqueta: string;
  href: string;
}

// Mismo menú que el sitio original. "Institucional" se enlaza desde Nosotros, Inicio y el footer.
export const navegacionPrincipal: EnlaceNav[] = [
  { etiqueta: 'Inicio', href: conBase('/') },
  { etiqueta: 'Nosotros', href: conBase('/nosotros/') },
  { etiqueta: 'Informes y Publicaciones', href: conBase('/publicaciones/') },
  { etiqueta: 'Prensa y Novedades', href: conBase('/prensa/') },
  { etiqueta: 'Contacto', href: conBase('/contacto/') },
];

/** Secciones hijas: marcan como activo a su padre en el menú. */
export const seccionPadre: Record<string, string> = {
  [conBase('/institucional/')]: conBase('/nosotros/'),
  [conBase('/visor/')]: conBase('/publicaciones/'),
};
