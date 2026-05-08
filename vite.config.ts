/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  server: {
    // Proxy /api/* to the Express dev server so you only need `npm run dev`
    // alongside `npm start` (Express on :5000 handles the API key securely)
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
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
