import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Proxy API requests to Python backend in development
      '/api': {
        target: process.env.VITE_PYTHON_BACKEND_URL || 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  preview: {
    port: 4173,
    host: true
  }
})
