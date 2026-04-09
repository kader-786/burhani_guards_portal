import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/BURHANI_GUARDS_TEST/',
  build: {
    chunkSizeWarningLimit: 60000,
  },
  define: {
    'process.env': {},
  },
  server: {
    host: true,
  },
})

