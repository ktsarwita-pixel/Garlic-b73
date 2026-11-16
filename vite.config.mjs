import { defineConfig } from 'vite';
import { cpSync } from 'node:fs';

// Garlic Wars is a no-dependency static game: index.html loads nine classic
// (non-module) scripts from js/. Vite handles the CSS/assets build, and this
// plugin copies the plain script files through to dist/js untouched.
export default defineConfig({
  publicDir: false,
  plugins: [
    {
      name: 'garlic-wars-static-scripts',
      closeBundle() {
        cpSync('js', 'dist/js', { recursive: true });
      }
    }
  ]
});
