import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/meals': 'http://localhost:3000',
      '/watchlist': 'http://localhost:3000',
      '/history': 'http://localhost:3000',
      '/undo': 'http://localhost:3000',
    },
  },
})
