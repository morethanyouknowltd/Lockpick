import { resolve } from 'path'
import { defineConfig, searchForWorkspaceRoot } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    {
      name: 'watch-node-modules',
      configureServer: (server: ViteDevServer): void => {
        server.watcher.options = {
          ...server.watcher.options,
          ignored: [/node_modules\/(?!@mtyk).*/, '**/.git/**'],
        }
      },
    },
    react({
      babel: {
        parserOpts: {
          plugins: ['decorators-legacy'],
        },
      },
    }),
  ],
  optimizeDeps: {
    exclude: ['@mtyk/ui'],
  },
  fs: {
    allow: [
      // search up for workspace root
      '..',
      '../..',
      '../../..',
    ],
  },
  base: './',
  root: resolve('./src/renderer'),
  server: {
    port: 8081,
    hmr: { overlay: false },
    strictPort: true,
  },
  resolve: {
    preserveSymlinks: true,
  },
  build: {
    outDir: resolve('./dist/renderer'),
    emptyOutDir: true,
  },
})
