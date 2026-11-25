import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from https://gogulavanis2023-ui.github.io/gogulavani-portfolio/
export default defineConfig({
  base: '/gogulavani-portfolio/',
  plugins: [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
  },
});
