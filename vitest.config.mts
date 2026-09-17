import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@docusaurus/Link': path.resolve('node_modules/@docusaurus/core/lib/client/exports/Link.js'),
      '@docusaurus/useBaseUrl': path.resolve(
        'node_modules/@docusaurus/core/lib/client/exports/useBaseUrl.js'
      ),
      '@docusaurus/useDocusaurusContext': path.resolve(
        'node_modules/@docusaurus/core/lib/client/exports/useDocusaurusContext.js'
      ),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    restoreMocks: true,
    css: {
      include: [/\.module\.css$/],
    },
  },
})
