import { resolve } from 'node:path';
import { cpSync } from 'node:fs';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [{ name: 'preserve-designed-image-paths', closeBundle() { cpSync(resolve(__dirname, 'assets'), resolve(__dirname, 'dist/assets'), { recursive: true }); } }],
  server: {
    proxy: {
      '/api/demo': {
        target: 'http://127.0.0.1:8001',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/api': {
        target: 'https://energios-backend.vercel.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        dashboard: resolve(__dirname, 'index.html'),
        diagnostics: resolve(__dirname, 'diagnostics.html'),
        energy: resolve(__dirname, 'energy.html'),
        digitalTwin: resolve(__dirname, 'digital-twin.html'),
        settings: resolve(__dirname, 'settings.html'),
        methodology: resolve(__dirname, 'methodology.html'),
      },
    },
  },
});
