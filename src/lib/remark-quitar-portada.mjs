/**
 * Quita la "portada" de un Markdown: el H1 inicial y, si existe, el párrafo
 * en negrita que lo sigue. Cada página ya define su propio <h1>, así se evita
 * duplicarlo sin modificar los archivos de contenido.
 */
export default function remarkQuitarPortada() {
  return (arbol) => {
    const [primero, segundo] = arbol.children;
    if (primero?.type !== 'heading' || primero.depth !== 1) return;

    const subtituloEnNegrita =
      segundo?.type === 'paragraph' &&
      segundo.children.length === 1 &&
      segundo.children[0].type === 'strong';

    arbol.children.splice(0, subtituloEnNegrita ? 2 : 1);
  };
}
