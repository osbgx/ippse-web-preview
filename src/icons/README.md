# Iconos locales

Esta carpeta existe para que `astro-icon` no advierta por su ausencia.

El proyecto **no usa SVG dibujados a mano**: todos los iconos provienen de un icon pack
(Lucide para la interfaz, Simple Icons para logotipos de marca) y se registran en
`astro.config.mjs`.

Si en algún momento hace falta un icono propio, colocar el `.svg` acá y usarlo con
`<Icon name="nombre-del-archivo" />`.
