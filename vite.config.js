import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/ai-metenrichement-frontend/',
  server: {
    port: 5173,
    proxy: {
      // Forward /api/* to FastAPI during dev — not needed since we use full URL
    },
  },
})
