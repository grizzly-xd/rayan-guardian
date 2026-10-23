import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
    css: false,
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    exclude: ['node_modules', 'dist'],
  },
});
