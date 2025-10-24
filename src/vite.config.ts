import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // 👇 Tell Vite where your frontend source code is
  root: 'src',

  // 👇 Build output directory (Vercel serves from this)
  build: {
    outDir: '../dist', // adjust if your package.json is at the project root
    emptyOutDir: true,
  },

  server: {
    port: 5173,
    host: true,
    proxy: {
      // 👇 Proxy API requests to your backend during local dev
      '/api': {
        target: process.env.VITE_PYTHON_BACKEND_URL || 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  preview: {
    port: 4173,
    host: true,
  },
})