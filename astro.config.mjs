// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { rehypeBaseLinks } from './src/lib/rehype-base-links.mjs';

// GitHub Pages: https://guidokl.github.io/voidfpv
// Eigene Domain spaeter? Dann site anpassen und base auf '/' setzen.
const BASE = '/voidfpv';

export default defineConfig({
  site: 'https://guidokl.github.io',
  base: BASE,
  trailingSlash: 'ignore',
  output: 'static',
  integrations: [sitemap()],
  build: { format: 'directory' },
  devToolbar: { enabled: false },
  markdown: {
    rehypePlugins: [[rehypeBaseLinks, { base: BASE }]],
  },
});
