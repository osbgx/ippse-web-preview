// Utilidades para construir rutas internas respetando el "base" de Astro.
//
// El mismo código sirve para dos destinos:
//   - cPanel con dominio propio  -> base "/"           -> /prensa/
//   - GitHub Pages (subcarpeta)  -> base "/ippse-web"  -> /ippse-web/prensa/
//
// Se usa en los datos (enlaces de navegación, PDF, alertas) y en las páginas,
// de modo que ningún enlace quede hardcodeado a la raíz del dominio.

/** Une el base con una ruta interna absoluta. */
export const conBase = (ruta: string): string => {
  if (!ruta.startsWith('/')) return ruta;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${ruta}`;
};

/** true cuando el sitio se compila para GitHub Pages (subcarpeta). */
export const enSubcarpeta = import.meta.env.BASE_URL !== '/';
