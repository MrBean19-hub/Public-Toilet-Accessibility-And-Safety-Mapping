import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// VITE_BASE lets the same build work on GitHub Pages (/repo-name/) and on
// Vercel / Netlify (/). It is set by .github/workflows/deploy.yml.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  build: { sourcemap: false, chunkSizeWarningLimit: 600 },
});
