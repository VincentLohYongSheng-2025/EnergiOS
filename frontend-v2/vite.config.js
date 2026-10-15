import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
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
      },
    },
  },
});
