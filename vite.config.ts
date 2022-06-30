import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      parserOpts: {
        plugins: ['decorators-legacy'],
      },
    }),
  ],
  base: './',
  root: resolve('./src/renderer'),
  server: {
    port: 8081,
    hmr: { overlay: false },
    strictPort: true,
  },

  build: {
    outDir: resolve('./dist/renderer'),
    emptyOutDir: true,
  },
})
