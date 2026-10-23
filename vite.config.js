import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// In development the React app runs on :5173 and forwards /api calls to the Express server on :5000.
// In production the Express server serves the built app itself, so no proxy is needed.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': process.env.VITE_DEV_API || 'http://localhost:5000',
    },
  },
})
