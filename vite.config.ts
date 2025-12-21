import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    fs: {
      // Permitir servir archivos desde la carpeta midi
      allow: ['..']
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  publicDir: 'public',
  assetsInclude: ['**/*.mid', '**/*.midi']
})
