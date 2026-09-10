import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api/ai': {
        target: 'https://danh-gia-phim.vercel.app',
        changeOrigin: true,
      },
    },
  },
})
