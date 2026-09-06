import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev
export default defineConfig({
  plugins: [react()],
  preview: {
    port: 3000,
    strictPort: true,
    host: true // 👈 This natively tells your version of Vite to allow external network tunnels!
  }
})


