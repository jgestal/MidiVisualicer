import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  // Base path: '/' para desarrollo, '/MidiVisualicer/' para producción (GitHub Pages)
  const base = command === 'build'
    ? process.env.VITE_BASE_URL || '/MidiVisualicer/'
    : '/';

  return {
    base,
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
      fs: {
        // Permitir servir archivos desde la carpeta midi
        allow: ['..'],
      },
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    publicDir: 'public',
    assetsInclude: ['**/*.mid', '**/*.midi'],
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            // Separar vendors para mejor caching
            'vendor-react': ['react', 'react-dom'],
            'vendor-audio': ['tone', '@tonejs/midi'],
            'vendor-notation': ['vexflow'],
          },
        },
      },
    },
  };
});
