// Kjør renderer alene i nettleseren (lagrer da i localStorage): npm run web
import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  root: resolve(import.meta.dirname, 'src/renderer'),
  resolve: { alias: { '@': resolve(import.meta.dirname, 'src/renderer/src') } },
  plugins: [react(), tailwindcss()],
  server: { host: '127.0.0.1', port: 5199, strictPort: true }
})
