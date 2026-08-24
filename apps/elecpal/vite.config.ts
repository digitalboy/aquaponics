import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  root: resolve(__dirname, 'web'),
  publicDir: resolve(__dirname, 'examples'),
  resolve: {
    alias: {
      '@': resolve(__dirname, 'web'),
      '@aquaponics/schema': resolve(__dirname, '../../packages/schema/src/index.ts'),
      '@core': resolve(__dirname, 'src/core'),
      '@renderers': resolve(__dirname, 'src/renderers'),
      '@services': resolve(__dirname, 'src/services'),
      '@config': resolve(__dirname, 'src/config'),
      '@ai': resolve(__dirname, 'src/ai')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true
  }
});
