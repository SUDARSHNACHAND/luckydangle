import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: './',
  root: './',
  publicDir: 'public',
  server: {
    port: 3000,
    open: false
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        overlay: path.resolve(__dirname, 'overlay.html'),
        tray: path.resolve(__dirname, 'tray.html')
      }
    }
  },
  resolve: {
    alias: {
      '@charms': path.resolve(__dirname, './charms')
    }
  }
});
