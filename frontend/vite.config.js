import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
<<<<<<< HEAD
        target: process.env.BACKEND_URL || 'http://localhost:3000',
=======
        target: process.env.VITE_PROXY_TARGET || process.env.BACKEND_URL || 'http://backend:3000',
>>>>>>> 1c1276c3eeab8609d0bab542bba4b67e9700713d
        changeOrigin: true
      }
    }
  }
})
