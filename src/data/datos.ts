// Datos para gráficos (/datos/).
//
// Cada gráfico es un .md del repositorio de documentos (contenido/datos/) con una
// tabla Markdown: la primera columna es la etiqueta y las siguientes, números en
// formato paraguayo (1.550 / 39,7). Así las cifras siguen siendo texto legible
// para personas y para LLMs, y el sitio las dibuja.

import { getCollection } from 'astro:content';
import { getPublicaciones, urlVisor } from './publicaciones';

export interface Fila {
  etiqueta: string;
  /** "barras": valor. "rango": mínimo. */
  desde: number;
  /** "rango": máximo. En "barras" es igual a `desde`. */
  hasta: number;
}

export interface ConjuntoDatos {
  id: string;
  titulo: string;
  descripcion: string;
  forma: 'rango' | 'barras';
  unidad: string;
  /** Encabezados de la tabla original (para la vista de tabla). */
  columnas: string[];
  filas: Fila[];
  referencia?: { valor: number; texto: string };
  informe: { id: string; titulo: string; url: string } | null;
}

/** "1.550" -> 1550 · "39,7" -> 39.7 · "**397,8**" -> 397.8 */
const numero = (celda: string) => Number(celda.replace(/[*\s]/g, '').replace(/\./g, '').replace(',', '.'));

/** Primera tabla Markdown del cuerpo: encabezados y filas de celdas. */
const leerTabla = (md: string) => {
  const lineas = md.split(/\r?\n/).filter((l) => /^\s*\|/.test(l));
  const celdas = (l: string) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  const [encabezado, , ...cuerpo] = lineas;
  return { columnas: encabezado ? celdas(encabezado) : [], filas: cuerpo.map(celdas) };
};

export const getDatos = async (): Promise<ConjuntoDatos[]> => {
  const publicaciones = await getPublicaciones();
  return (await getCollection('datos'))
    .sort((a, b) => a.data.orden - b.data.orden)
    .map((e) => {
      const { columnas, filas } = leerTabla(e.body ?? '');
      const informe = publicaciones.find((p) => p.id === e.data.informe);
      return {
        id: e.id,
        titulo: e.data.titulo,
        descripcion: e.data.descripcion,
        forma: e.data.forma,
        unidad: e.data.unidad,
        columnas,
        filas: filas
          .map((c) => ({ etiqueta: c[0], desde: numero(c[1]), hasta: numero(e.data.forma === 'rango' ? c[2] : c[1]) }))
          .filter((f) => f.etiqueta && Number.isFinite(f.desde) && Number.isFinite(f.hasta)),
        referencia:
          e.data.referencia !== undefined ? { valor: e.data.referencia, texto: e.data.referenciaTexto ?? '' } : undefined,
        informe: informe ? { id: informe.id, titulo: informe.titulo, url: urlVisor(informe.id) } : null,
      };
    });
};

/** Número en formato es-PY (1.550 · 39,7). */
export const formatoNumero = (n: number) => n.toLocaleString('es-PY', { maximumFractionDigits: 1 });

/** Escala "linda" para el eje: tope redondeado y 4-6 marcas. */
export const escala = (maximo: number) => {
  const pasoBruto = maximo / 5;
  const magnitud = 10 ** Math.floor(Math.log10(pasoBruto));
  const paso = [1, 2, 2.5, 5, 10].map((m) => m * magnitud).find((p) => p >= pasoBruto) ?? magnitud * 10;
  const tope = Math.ceil(maximo / paso) * paso;
  return { tope, marcas: Array.from({ length: Math.round(tope / paso) + 1 }, (_, i) => i * paso) };
};
