// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkQuitarPortada from './src/lib/remark-quitar-portada.mjs';
import rehypeInformes from './src/lib/rehype-informes.mjs';

// Sitio 100 % estático: el contenido de dist/ se sube tal cual a public_html en cPanel.
// El "base" se define por entorno:
//   - GitHub Pages (hosting temporal): DEPLOY_TARGET=pages  -> https://osbgx.github.io/ippse-web/
//   - cPanel / dominio propio:         (por defecto)        -> https://ippse.org.py/ (sin www; .htaccess redirige www)
const enGitHubPages = process.env.DEPLOY_TARGET === 'pages';
const base = enGitHubPages ? (process.env.PAGES_BASE || '/ippse-web') : '/';

export default defineConfig({
  site: enGitHubPages ? 'https://osbgx.github.io' : 'https://ippse.org.py',
  base,
  output: 'static',
  build: {
    format: 'directory', // /institucional/ -> institucional/index.html (compatible con Apache)
  },
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    // Fórmulas ($…$ y $$…$$) con KaTeX en el build; el "$" de moneda se escribe "\$"
    // (el loader escapa solo "US$"). Ajustes de tablas, H1, enlaces y diagramas: rehype-informes.
    remarkPlugins: [remarkQuitarPortada, remarkMath],
    rehypePlugins: [[rehypeKatex, { output: 'html', strict: false }], rehypeInformes],
    // Los bloques ```mermaid no se colorean: se convierten en diagramas.
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] },
    remarkRehype: {
      footnoteLabel: 'Notas',
      footnoteLabelTagName: 'h2',
      footnoteBackLabel: (indice) => `Volver a la referencia ${indice + 1}`,
    },
  },
  integrations: [
    // Iconos de un icon pack (nunca SVG dibujados a mano en el código).
    // Lucide para la interfaz; Simple Icons para logotipos de marca (p. ej. WhatsApp).
    icon({
      include: {
        lucide: ['*'],
        'simple-icons': ['whatsapp', 'facebook', 'instagram', 'linkedin', 'x', 'youtube'],
      },
    }),
  ],
});
