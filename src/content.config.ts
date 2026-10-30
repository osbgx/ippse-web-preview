import { defineCollection, z } from 'astro:content';
import {
  datosRemotos, glosarioRemoto, sitioRemoto, sociosRemotos, institucionalRemoto, prensaRemota, preguntasRemotas, publicacionesRemotas,
} from './lib/cargador-publicaciones';

// Documentos institucionales (Constitución, Estatutos, Código de Ética, etc.)
const institucional = defineCollection({
  loader: institucionalRemoto,
});

// Prensa y Novedades: comunicados, apariciones en medios y eventos.
// Un solo directorio; el campo `tipo` distingue la clase de entrada.
// Vive en el repositorio de contenido (contenido/prensa/), igual que los informes.
const prensa = defineCollection({
  loader: prensaRemota,
  schema: z
    .object({
      tipo: z.enum(['comunicado', 'aparicion', 'evento']),
      /** Fecha ISO: AAAA-MM-DD, o AAAA-MM cuando no hay día exacto. Acepta fechas sin comillas de YAML. */
      fecha: z.coerce.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, 'Usar AAAA-MM-DD o AAAA-MM'),
      titulo: z.string(),
      /** Fecha de última actualización (ISO). */
      actualizado: z.coerce.string().regex(/^\d{4}-\d{2}(-\d{2})?$/).optional(),
      /** Resumen/extracto del artículo (recomendado para SEO y accesibilidad). */
      extracto: z.string().optional(),
      /** Etiquetas libres para clasificar la entrada. */
      tags: z.array(z.string()).default([]),
      /** Palabras clave para SEO y buscadores. */
      keywords: z.array(z.string()).default([]),
      /** Autor o responsable de la entrada. */
      autor: z.string().optional(),
      /** Categoría temática. */
      categoria: z.string().optional(),
      /** Idioma del contenido (BCP 47). */
      idioma: z.string().default('es-PY'),
      /** Identificador estable (DOI, slug, etc.). */
      idExterno: z.string().optional(),
      /** Licencia del contenido. */
      licencia: z.string().optional(),
      /**
       * Informes con los que se relaciona la entrada (nombre del archivo sin .md,
       * p. ej. ["informe-2-26"]). Arma la "Cobertura en medios" de cada informe.
       */
      informes: z.array(z.string()).default([]),
    })
    .and(
      z.discriminatedUnion('tipo', [
        z.object({ tipo: z.literal('comunicado'), extracto: z.string() }),
        z.object({ tipo: z.literal('aparicion'), medio: z.string(), url: z.string().url().optional() }),
        z.object({ tipo: z.literal('evento'), tipoEvento: z.string(), lugar: z.string() }),
      ]),
    ),
});

// Informes y Publicaciones: el contenido vive en el repositorio externo de
// documentos (ver src/data/fuenteDocumentos.ts). El loader lo descarga en build.
// El esquema refleja esquema/publicacion.schema.json del repositorio.
const publicaciones = defineCollection({
  loader: publicacionesRemotas,
  schema: z.object({
    titulo: z.string().min(3),
    /** Fecha ISO (AAAA-MM-DD o AAAA-MM); se acepta sin comillas en el YAML. */
    fecha: z.coerce.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, 'Usar AAAA-MM-DD o AAAA-MM'),
    categoria: z.enum(['diagnostico', 'propuesta', 'opinion']),
    autor: z.string().min(2),
    extracto: z.string().min(10).max(320),
    /** Minutos de lectura estimados (opcional). */
    lectura: z.number().int().positive().optional(),
    /** "proximamente" deja la tarjeta sin enlace al visor. */
    estado: z.enum(['publicado', 'proximamente']).default('publicado'),
    /** Ruta del PDF oficial en el propio sitio, si existe. */
    pdf: z.string().optional(),
    /** Imagen de portada, relativa a imagenes/<id>/. */
    portada: z.string().optional(),
    etiquetas: z.array(z.string()).default([]),
    /** true para resaltar la publicación en la portada. */
    destacado: z.boolean().default(false),
  }),
});

// Glosario y FAQ: viven en el repositorio de contenido, igual que los informes,
// para que el IPPSE los edite sin tocar el código del sitio.
const glosario = defineCollection({
  loader: glosarioRemoto,
  schema: z.object({
    termino: z.string().min(1),
    /** Sigla desarrollada o nombre en inglés. */
    sigla: z.string().optional(),
    /** Nombres de archivo (sin .md) de términos relacionados. */
    relacionados: z.array(z.string()).default([]),
  }),
});

const preguntasFrecuentes = defineCollection({
  loader: preguntasRemotas,
  schema: z.object({
    pregunta: z.string().min(5),
    /** Posición en la página (1 = primera). */
    orden: z.number().int().default(100),
  }),
});

// Datos: cifras de los informes en tablas Markdown, que /datos/ dibuja como gráficos.
const datos = defineCollection({
  loader: datosRemotos,
  schema: z.object({
    titulo: z.string().min(3),
    /** Una o dos frases: qué muestra y qué conclusión sale del gráfico. */
    descripcion: z.string().min(10),
    /** Informe del que salen las cifras (nombre del archivo sin .md). */
    informe: z.string(),
    /** "rango": columnas Mínimo y Máximo. "barras": un valor por fila. */
    forma: z.enum(['rango', 'barras']),
    unidad: z.string(),
    orden: z.number().int().default(100),
    /** Línea de referencia opcional (en la unidad del gráfico) y su rótulo. */
    referencia: z.number().optional(),
    referenciaTexto: z.string().optional(),
  }),
});

// Directorio de socios: solo quienes autorizaron figurar (consentimiento: true).
const socios = defineCollection({
  loader: sociosRemotos,
  schema: z.object({
    nombre: z.string().min(3),
    categoria: z.enum(['fundador', 'adherente', 'emerito', 'colectivo']),
    especialidad: z.string().min(2),
    /** Autorización escrita del socio para publicar su nombre. Obligatoria. */
    consentimiento: z.literal(true),
  }),
});

// Secciones fijas del sitio (cinta, informe destacado, equipo). Cada archivo tiene su
// propio formato; lo interpreta y valida src/data/contenidoSitio.ts.
const sitio = defineCollection({
  loader: sitioRemoto,
  schema: z.object({ titulo: z.string() }).passthrough(),
});

export const collections = { institucional, prensa, publicaciones, glosario, preguntasFrecuentes, datos, socios, sitio };
