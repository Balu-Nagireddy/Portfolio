import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative base works on GitHub Pages (/Portfolio/) AND Vercel (root) AND any subpath.
  base: './',
  plugins: [react()],
});
