// Resuelve, en el HTML de un documento, las rutas relativas que apuntan a archivos
// del repositorio de contenido (imágenes, PDFs, otros .md).
//
// Las rutas se interpretan desde la carpeta del .md (p. ej. contenido/publicaciones/):
//   ../../imagenes/informe-2-26/figura.png -> <repo>/imagenes/informe-2-26/figura.png
//   ../../documentos/informe-2-26.pdf      -> <repo>/documentos/informe-2-26.pdf
//   otro-informe.md                        -> /publicaciones/otro-informe/
// Los "..": se resuelven de verdad y no pueden salir de la raíz del repositorio.

import { baseDocumentos } from '../data/fuenteDocumentos';
import { conBase } from './rutas';

const unir = (carpeta: string, ruta: string) => {
  const pila: string[] = [];
  for (const parte of [...carpeta.split('/'), ...ruta.split('/')]) {
    if (parte === '' || parte === '.') continue;
    if (parte === '..') pila.pop();
    else pila.push(parte);
  }
  return pila.join('/');
};

/** ¿Es una ruta relativa (no http, no /raíz, no #ancla, no data:/mailto:)? */
const esRelativa = (ruta: string) => !/^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(ruta);

export const resolverRutasRepo = (html: string, carpeta: string) =>
  html.replace(/\s(src|href)="([^"]+)"/g, (todo, atributo: string, ruta: string) => {
    if (!esRelativa(ruta)) return todo;
    // Enlace a otro documento del repositorio -> su página en el sitio.
    const otroMd = ruta.match(/^(?:\.{1,2}\/)*([^/]+?)\.md(#.*)?$/i);
    if (atributo === 'href' && otroMd) return ` href="${conBase(`/publicaciones/${otroMd[1]}/`)}${otroMd[2] ?? ''}"`;
    const url = `${baseDocumentos()}/${unir(carpeta, ruta)}`;
    // Archivos (PDF, planillas…) en pestaña nueva; las imágenes se muestran en la página.
    return atributo === 'href' ? ` href="${url}" target="_blank" rel="noopener noreferrer"` : ` src="${url}"`;
  });
