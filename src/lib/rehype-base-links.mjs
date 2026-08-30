/**
 * Interne Links in Markdown-Inhalten bekommen den base-Pfad vorangestellt.
 * Ohne das zeigt jedes /wissen aus einer .md-Datei auf guidokl.github.io/wissen
 * statt auf guidokl.github.io/voidfpv/wissen — die klassische Pages-Falle.
 *
 * Externe Links bekommen zusaetzlich rel="noopener" und target="_blank".
 */
import { visit } from 'unist-util-visit';

export function rehypeBaseLinks(options = {}) {
  const base = (options.base ?? '/').replace(/\/+$/, '');

  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a') return;
      const href = node.properties?.href;
      if (typeof href !== 'string') return;

      // Intern und absolut -> base davor, aber nicht doppelt
      if (href.startsWith('/') && !href.startsWith('//')) {
        if (base && !href.startsWith(base + '/') && href !== base) {
          node.properties.href = base + href;
        }
        return;
      }

      // Extern -> in neuem Tab, ohne Referrer-Leak
      if (/^https?:\/\//.test(href)) {
        node.properties.target = '_blank';
        node.properties.rel = 'noopener noreferrer';
      }
    });
  };
}
