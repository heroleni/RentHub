import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Todas las llamadas /api/* se reenvían al backend en Docker
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // Elimina trailing slash para que ASP.NET Minimal API no devuelva 404
        rewrite: (path) => path.replace(/\/+$/, ''),
      },
    },
  },
})
