/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main:    resolve(__dirname, 'index.html'),
        weather: resolve(__dirname, 'weather.html'),
      },
    },
  },
  test: {
    environment: 'node',
    globals: true,
  },
});
