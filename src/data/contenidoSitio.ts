// Secciones fijas del sitio leídas del repositorio de documentos (contenido/sitio/):
//
//   ultima-hora.md        -> cinta "Última hora" (alertas.ts)
//   informe-destacado.md  -> bloque del informe en Inicio (informeDestacado.ts)
//   equipo.md             -> referentes y cita del presidente (institucion.ts)
//
// Se leen una sola vez (top-level await) y los módulos de datos exponen los mismos
// nombres de siempre, así ninguna página cambia. Si un archivo falta o no se puede
// interpretar, se registra el error (aviso en el repositorio de documentos) y se
// usan los valores por defecto del código: la web nunca queda sin esa sección.

import { getCollection } from 'astro:content';
import { conBase } from '../lib/rutas';
import { registrarErrorContenido } from '../lib/errores-contenido';

type Entrada = { id: string; data: Record<string, unknown>; body?: string };

const entradas: Entrada[] = await getCollection('sitio').catch(() => []);
const porId = new Map(entradas.map((e) => [e.id, e]));

/** Enlaces del contenido: las rutas internas ("/prensa/") llevan el base del sitio. */
const enlace = (href: string) => (href.startsWith('/') ? conBase(href) : href);

/** Primera tabla Markdown de un texto: filas de celdas (sin encabezado). */
export const filasDeTabla = (md: string): string[][] =>
  md
    .split(/\r?\n/)
    .filter((l) => /^\s*\|/.test(l))
    .slice(2)
    .map((l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));

/** Secciones "## Título" de un Markdown -> { título en minúsculas: texto }. */
const secciones = (md: string) =>
  Object.fromEntries(
    md
      .split(/^## /m)
      .slice(1)
      .map((bloque) => {
        const [titulo, ...resto] = bloque.split(/\r?\n/);
        return [titulo.trim().toLowerCase(), resto.join('\n').trim()];
      }),
  );

/** Ítems de una lista "- …" de un texto. */
const items = (md: string) =>
  md
    .split(/\r?\n/)
    .filter((l) => /^\s*[-*]\s+/.test(l))
    .map((l) => l.replace(/^\s*[-*]\s+/, '').trim());

/** Ejecuta un intérprete; si falla, registra el error y devuelve undefined (se usa el valor por defecto). */
const leer = <T>(id: string, interpretar: (e: Entrada) => T): T | undefined => {
  const entrada = porId.get(id);
  if (!entrada) return undefined;
  try {
    return interpretar(entrada);
  } catch (error) {
    registrarErrorContenido({
      archivo: `contenido/sitio/${id}.md`,
      detalle: `${error instanceof Error ? error.message : error} Se muestran los valores anteriores.`,
    });
    return undefined;
  }
};

const exigir = <T>(valor: T | undefined | null, mensaje: string): T => {
  if (valor === undefined || valor === null || (Array.isArray(valor) && valor.length === 0)) throw new Error(mensaje);
  return valor;
};

// --- Cinta de última hora ---------------------------------------------------

export type TipoAlertaSitio = 'Alerta' | 'Informe' | 'Evento' | 'Comunicado';
const tiposAlerta = ['Alerta', 'Informe', 'Evento', 'Comunicado'];

export const alertasSitio = leer('ultima-hora', (e) =>
  exigir(
    items(e.body ?? '').map((linea) => {
      const m = linea.match(/^\*\*(\w+)\*\*:?\s*\[([^\]]+)\]\(([^)]+)\)/);
      if (!m) throw new Error(`No se entiende la línea «${linea}». Formato: - **Tipo**: [texto](enlace).`);
      if (!tiposAlerta.includes(m[1])) throw new Error(`Tipo «${m[1]}» no válido: usar ${tiposAlerta.join(', ')}.`);
      return { tipo: m[1] as TipoAlertaSitio, texto: m[2], href: enlace(m[3]) };
    }),
    'La cinta no tiene avisos.',
  ),
);

// --- Equipo y cita del presidente -------------------------------------------

export const equipoSitio = leer('equipo', (e) =>
  exigir(
    filasDeTabla(e.body ?? '').map(([nombre, rol, bio]) => {
      if (!nombre || !rol || !bio) throw new Error('Cada fila del equipo necesita Nombre, Rol y Descripción.');
      return { nombre, rol, bio };
    }),
    'Falta la tabla del equipo.',
  ),
);

export const citaPresidenteSitio = leer('equipo', (e) => {
  const { cita, citaAutor } = e.data as { cita?: string; citaAutor?: string };
  return cita && citaAutor ? { texto: cita, autor: citaAutor } : undefined;
});

// --- Informe destacado en Inicio ---------------------------------------------

export const informeDestacadoSitio = leer('informe-destacado', (e) => {
  const d = e.data as Record<string, string | undefined>;
  const s = secciones(e.body ?? '');
  const paradigma = s['cambio de paradigma'] ?? '';
  const valorDe = (etiqueta: string) =>
    items(paradigma)
      .find((i) => i.toLowerCase().startsWith(`**${etiqueta}:**`))
      ?.replace(/^\*\*[^*]+\*\*\s*/, '');

  return {
    id: exigir(d.informe, 'Falta el campo «informe».'),
    numero: exigir(d.numero, 'Falta el campo «numero».'),
    parte: d.parte ?? '',
    aprobado: String(d.aprobado ?? ''),
    periodo: d.periodo ?? '',
    bajada: exigir(s['bajada'], 'Falta la sección «## Bajada».').replace(/\s+/g, ' '),
    desafios: exigir(items(s['desafíos'] ?? s['desafios'] ?? ''), 'Falta la lista de «## Desafíos».').map(
      (texto, i) => ({ letra: String.fromCharCode(97 + i), texto }),
    ),
    cifras: exigir(filasDeTabla(s['cifras'] ?? ''), 'Falta la tabla de «## Cifras».').map(([valor, etiqueta]) => ({
      valor,
      etiqueta,
    })),
    alternativas: exigir(filasDeTabla(s['alternativas'] ?? ''), 'Falta la tabla de «## Alternativas».').map(
      ([fuente, plazo, horizonte, firme]) => ({ fuente, plazo, horizonte, firme: /^s[ií]/i.test(firme ?? '') }),
    ),
    paradigma: {
      titulo: 'Cambio de paradigma',
      antes: exigir(valorDe('antes'), 'Falta «- **Antes:** …» en «## Cambio de paradigma».'),
      ahora: exigir(valorDe('ahora'), 'Falta «- **Ahora:** …» en «## Cambio de paradigma».'),
      texto: paradigma
        .split(/\r?\n/)
        .filter((l) => l.trim() && !/^\s*[-*]\s+/.test(l))
        .join(' ')
        .trim(),
    },
  };
});
