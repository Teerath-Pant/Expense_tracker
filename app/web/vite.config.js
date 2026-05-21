import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/rpc': {                          // ✅ matches Express /rpc prefix
        target: 'http://localhost:4000', // ✅ matches PORT 4000
        changeOrigin: true,
      },
      '/health': {                       // ✅ also proxy the health check
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    }
  }
})