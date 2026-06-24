import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import purgecss from '@fullhuman/postcss-purgecss'
import type { Plugin } from 'vite'

// Post-process built index.html: convert <link rel="stylesheet"> to async preload.
// Safe for a CSR SPA — the HTML shell is an empty <div id="root">, so there is
// nothing to paint until JS runs. CSS doesn't need to block the initial render.
function asyncCSS(): Plugin {
  return {
    name: 'async-css',
    apply: 'build',
    transformIndexHtml(html: string) {
      return html.replace(
        /<link rel="stylesheet" crossorigin href="([^"]+\.css)">/g,
        `<link rel="preload" as="style" crossorigin href="$1" onload="this.onload=null;this.rel='stylesheet'">` +
        `<noscript><link rel="stylesheet" crossorigin href="$1"></noscript>`,
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), asyncCSS()],
  css: {
    postcss: {
      plugins: [
        purgecss({
          content: [
            './index.html',
            './src/**/*.{ts,tsx}',
          ],
          safelist: {
            // Classes added via classList.add() or computed template literals that
            // PurgeCSS can't see statically in JSX.
            standard: [
              // RevealObserver (App.tsx) adds this via classList.add()
              'is-revealed',
              // active state added to nav items via JS
              'active',
              'is-open',
              'is-active',
            ],
            // Suffix variants built from data values (thumbnailType, status, etc.)
            greedy: [
              /^cs-card--/,
              /^blog-card--/,
              /^ep-status-chip--/,
              /^ep-seo-hint--/,
              /^ep-char-counter--/,
              /^bld-upload-zone--/,
              /^ep-img-dropzone--/,
              /^ep-collapse__chevron--/,
              /^ep-tool-btn/,
              /^fcs__skeleton/,
            ],
          },
          keyframes: false,
          variables: false,
        }),
      ],
    },
    preprocessorOptions: {
      scss: {
        // Bootstrap 5.3.x uses deprecated Sass APIs internally; silence until Bootstrap 6
        silenceDeprecations: [
          'legacy-js-api',
          'import',
          'global-builtin',
          'color-functions',
          'if-function',
        ],
      },
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8788',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
