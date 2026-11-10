import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vercel serves the app from "/". GitHub Pages serves it from "/<repo>/",
  // so the Pages workflow sets VITE_BASE_PATH=/FastGrab/ when building.
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    port: 5173,
    // Forward API calls to the Express backend (server/) once it exists.
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
