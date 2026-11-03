// Datos de SEO compartidos: metadatos del <head>, datos estructurados (schema.org),
// robots.txt, sitemap.xml, llms.txt, humans.txt y el manifiesto web.

import { contacto, redesSociales } from './contacto';
import { conBase, enSubcarpeta } from '../lib/rutas';

/** Dominio definitivo (sin www). El "site" de astro.config.mjs debe coincidir. */
export const dominio = 'ippse.org.py';

export const nombreSitio = 'IPPSE';
export const nombreInstitucion = 'Instituto de Profesionales Paraguayos del Sector Eléctrico';

/** Autor del sitio web (desarrollo y diseño). Figura en todos los metadatos de autoría del sitio. */
export const autorSitio = {
  nombre: 'osbgx.dev',
  url: 'https://osbgx.dev',
};

/** Imagen para compartir en redes (Open Graph / X). 1200 × 630 px. */
export const imagenSocial = {
  ruta: '/og-ippse.jpg',
  ancho: 1200,
  alto: 630,
  alt: 'IPPSE — Instituto de Profesionales Paraguayos del Sector Eléctrico',
};

/** Fecha de fundación en ISO para schema.org (texto literal en institucion.ts). */
export const fundacionIso = '1993-04-23';

/** Palabras clave generales del sitio. */
export const palabrasClave = [
  'IPPSE',
  nombreInstitucion,
  'sector eléctrico paraguayo',
  'energía Paraguay',
  'soberanía energética',
  'ANDE',
  'Itaipú',
  'Yacyretá',
  'transmisión eléctrica',
  'matriz energética',
  'informes técnicos',
  'ingeniería eléctrica',
];

/**
 * true en el build de GitHub Pages (copia temporal de revisión): se marca noindex para que
 * los buscadores no la indexen y no compita con ippse.org.py como contenido duplicado.
 */
export const esCopiaDeRevision = enSubcarpeta;

/** Grafo base de schema.org: la institución, el sitio web y su autor. */
export const nodosBase = (site: URL) => {
  const raiz = new URL(import.meta.env.BASE_URL, site).href;
  return {
    raiz,
    organizacion: {
      '@type': ['Organization', 'NGO'],
      '@id': `${raiz}#organizacion`,
      name: nombreInstitucion,
      alternateName: nombreSitio,
      url: raiz,
      logo: {
        '@type': 'ImageObject',
        '@id': `${raiz}#logo`,
        url: new URL('icon-512.png', raiz).href,
        width: 512,
        height: 512,
        caption: nombreSitio,
      },
      image: { '@id': `${raiz}#logo` },
      foundingDate: fundacionIso,
      description:
        'Asociación civil técnica e independiente dedicada al estudio, análisis y desarrollo de propuestas ' +
        'estratégicas para el fortalecimiento del sector eléctrico nacional.',
      email: contacto.email,
      telephone: contacto.telefono,
      address: {
        '@type': 'PostalAddress',
        ...(contacto.direccion && { streetAddress: contacto.direccion }),
        addressLocality: 'Asunción',
        addressCountry: 'PY',
      },
      ...(redesSociales.length > 0 && { sameAs: redesSociales.map((r) => r.href) }),
      areaServed: { '@type': 'Country', name: 'Paraguay' },
      knowsAbout: ['Sector eléctrico', 'Energía', 'Planificación energética', 'Soberanía energética'],
    },
    autor: {
      '@type': 'Person',
      '@id': `${autorSitio.url}/#autor`,
      name: autorSitio.nombre,
      url: autorSitio.url,
    },
    sitio: {
      '@type': 'WebSite',
      '@id': `${raiz}#sitio`,
      url: raiz,
      name: nombreSitio,
      alternateName: nombreInstitucion,
      inLanguage: 'es-PY',
      publisher: { '@id': `${raiz}#organizacion` },
      author: { '@id': `${autorSitio.url}/#autor` },
      creator: { '@id': `${autorSitio.url}/#autor` },
    },
  };
};

export interface PaginaIndexable {
  /** Ruta interna sin base. */
  ruta: string;
  titulo: string;
  descripcion: string;
  prioridad: number;
  frecuencia: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

/** Páginas estáticas que se publican en sitemap.xml y llms.txt (las de prensa se agregan aparte). */
export const paginasIndexables: PaginaIndexable[] = [
  {
    ruta: '/',
    titulo: 'Inicio',
    descripcion: 'Presentación del IPPSE, misión, visión, valores y ejes estratégicos.',
    prioridad: 1,
    frecuencia: 'weekly',
  },
  {
    ruta: '/nosotros/',
    titulo: 'Quiénes Somos',
    descripcion:
      'Historia, misión, valores y equipo del Instituto de Profesionales Paraguayos del Sector Eléctrico, ' +
      'una asociación técnica independiente al servicio del desarrollo energético nacional.',
    prioridad: 0.8,
    frecuencia: 'monthly',
  },
  {
    ruta: '/institucional/',
    titulo: 'Institucional',
    descripcion: 'Constitución, Acta de constitución, Estatutos, Reglamento Interno y Código de Ética del IPPSE.',
    prioridad: 0.6,
    frecuencia: 'yearly',
  },
  {
    ruta: '/publicaciones/',
    titulo: 'Informes y Publicaciones',
    descripcion:
      'Repositorio de diagnósticos, propuestas estratégicas y ensayos técnicos elaborados por el IPPSE ' +
      'para el fortalecimiento del sector eléctrico nacional.',
    prioridad: 0.9,
    frecuencia: 'weekly',
  },
  {
    ruta: '/prensa/',
    titulo: 'Prensa y Novedades',
    descripcion: 'Comunicados de prensa, apariciones en medios y agenda de eventos, foros y debates del IPPSE.',
    prioridad: 0.8,
    frecuencia: 'weekly',
  },
  {
    ruta: '/contacto/',
    titulo: 'Contacto',
    descripcion: 'Contactá al Instituto de Profesionales Paraguayos del Sector Eléctrico (IPPSE): consultas, prensa e instituciones.',
    prioridad: 0.7,
    frecuencia: 'yearly',
  },
  {
    ruta: '/datos/',
    titulo: 'Datos',
    descripcion: 'Las cifras clave de los informes del IPPSE en gráficos: demanda y disponibilidad de potencia y energía, plazos, costos y potencia de las nuevas fuentes de generación.',
    prioridad: 0.8,
    frecuencia: 'monthly',
  },
  {
    ruta: '/socios/',
    titulo: 'Socios',
    descripcion: 'Cómo ser miembro del IPPSE: requisitos, categorías, proceso de ingreso y directorio de socios.',
    prioridad: 0.6,
    frecuencia: 'yearly',
  },
  {
    ruta: '/preguntas-frecuentes/',
    titulo: 'Preguntas frecuentes',
    descripcion: 'Respuestas claras sobre el futuro energético del Paraguay, basadas en los informes del IPPSE.',
    prioridad: 0.8,
    frecuencia: 'monthly',
  },
  {
    ruta: '/glosario/',
    titulo: 'Glosario técnico',
    descripcion: 'Términos técnicos del sector eléctrico explicados en lenguaje claro: HVDC, SMR, LCOE y más.',
    prioridad: 0.7,
    frecuencia: 'monthly',
  },
  {
    ruta: '/prensa/kit/',
    titulo: 'Kit de prensa',
    descripcion: 'Logos, texto institucional, presidente y contacto de prensa del IPPSE.',
    prioridad: 0.6,
    frecuencia: 'yearly',
  },
  { ruta: '/privacidad/', titulo: 'Política de privacidad', descripcion: 'Tratamiento de los datos personales del formulario de contacto.', prioridad: 0.3, frecuencia: 'yearly' },
  { ruta: '/accesibilidad/', titulo: 'Declaración de accesibilidad', descripcion: 'Compromiso del IPPSE con la accesibilidad web (WCAG 2.2).', prioridad: 0.3, frecuencia: 'yearly' },
  { ruta: '/terminos/', titulo: 'Términos de uso', descripcion: 'Condiciones de uso del sitio y de reproducción de sus contenidos.', prioridad: 0.3, frecuencia: 'yearly' },
];

/** URL absoluta de una ruta interna (respeta el base de Astro). */
export const urlAbsoluta = (ruta: string, site: URL) => new URL(conBase(ruta), site).href;
