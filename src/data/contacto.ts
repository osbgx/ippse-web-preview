// Datos de contacto del IPPSE — FUENTE ÚNICA.
//
// Para cambiar el email, el teléfono o el WhatsApp NO hace falta tocar las páginas:
// basta con editar estos valores (o definirlos por variables de entorno en un archivo
// .env, que no se sube al repositorio). Ver .env.example.
//
// Variables de entorno reconocidas (todas opcionales):
//   PUBLIC_IPPSE_EMAIL          -> correo institucional
//   PUBLIC_IPPSE_TELEFONO       -> teléfono tal como se muestra (ej. "+595 984 143 700")
//   PUBLIC_IPPSE_CIUDAD         -> ciudad (ej. "Asunción, Paraguay")
//   PUBLIC_IPPSE_WHATSAPP       -> URL completa del canal de WhatsApp
//   PUBLIC_IPPSE_DIRECCION      -> dirección física (si falta, no se muestra)
//   PUBLIC_IPPSE_EMAIL_PRENSA, PUBLIC_IPPSE_TELEFONO_PRENSA
//                               -> contacto de prensa (si falta, se usa el general)
//   PUBLIC_IPPSE_FACEBOOK, PUBLIC_IPPSE_INSTAGRAM, PUBLIC_IPPSE_LINKEDIN,
//   PUBLIC_IPPSE_X, PUBLIC_IPPSE_YOUTUBE
//                               -> URL completa de cada red (si falta, no se muestra)
//
// Las variables PUBLIC_* quedan disponibles tanto en el servidor (build) como en el
// cliente, por lo que se usan para que el mismo valor sirva en todo el sitio.

import { conBase } from '../lib/rutas';

const env = import.meta.env;

/** Valor de entorno o, si no está definido, el valor por defecto del repositorio. */
const o = (valor: string | undefined, porDefecto: string): string =>
  valor && valor.trim() !== '' ? valor.trim() : porDefecto;

export const contacto = {
  ciudad: o(env.PUBLIC_IPPSE_CIUDAD, 'Asunción, Paraguay'),
  email: o(env.PUBLIC_IPPSE_EMAIL, 'contacto@ippse.org.py'),
  /** Teléfono tal como se muestra en pantalla. */
  telefono: o(env.PUBLIC_IPPSE_TELEFONO, '+595 984 143 700'),
  /** Dirección física (calle y número). Vacía: no se muestra. */
  direccion: o(env.PUBLIC_IPPSE_DIRECCION, ''),
};

/** Contacto directo de prensa. Si no se define, se usan el correo y el teléfono generales. */
export const contactoPrensa = {
  email: o(env.PUBLIC_IPPSE_EMAIL_PRENSA, contacto.email),
  telefono: o(env.PUBLIC_IPPSE_TELEFONO_PRENSA, contacto.telefono),
};

export interface RedSocial {
  nombre: string;
  href: string;
  /** Icono de Simple Icons. */
  icono: string;
}

/**
 * Redes sociales. Solo se muestran las que tienen URL cargada, así no quedan
 * iconos que lleven a ningún lado.
 */
export const redesSociales: RedSocial[] = [
  { nombre: 'Facebook', href: o(env.PUBLIC_IPPSE_FACEBOOK, ''), icono: 'simple-icons:facebook' },
  { nombre: 'Instagram', href: o(env.PUBLIC_IPPSE_INSTAGRAM, ''), icono: 'simple-icons:instagram' },
  { nombre: 'LinkedIn', href: o(env.PUBLIC_IPPSE_LINKEDIN, ''), icono: 'simple-icons:linkedin' },
  { nombre: 'X', href: o(env.PUBLIC_IPPSE_X, ''), icono: 'simple-icons:x' },
  { nombre: 'YouTube', href: o(env.PUBLIC_IPPSE_YOUTUBE, ''), icono: 'simple-icons:youtube' },
].filter((red) => red.href !== '');

/** Teléfono listo para un enlace tel: (sin espacios ni guiones). */
export const telefonoEnlace = contacto.telefono.replace(/[\s()-]/g, '');

/** Canal de WhatsApp: difusión de informes y participación ciudadana. */
export const canalWhatsApp = o(
  env.PUBLIC_IPPSE_WHATSAPP,
  'https://whatsapp.com/channel/000000000000000',
);

/** Script PHP de cPanel que recibe el formulario (ver public/enviar.php). */
export const accionFormulario = conBase('/enviar.php');
