import { resolve } from 'path'
import { defineConfig, searchForWorkspaceRoot } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

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
    tsconfigPaths(),
    react({
      babel: {
        parserOpts: {
          plugins: ['decorators-legacy'],
        },
      },
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
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
