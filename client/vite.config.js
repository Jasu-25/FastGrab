import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Forward API calls to the Express backend (server/) once it exists.
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
