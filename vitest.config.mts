import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { alias: { '@': resolve(import.meta.dirname, 'src/renderer/src') } },
  test: { include: ['tests/**/*.test.ts'] }
})
