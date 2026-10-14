import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

// WarpDrive reads build flags through @embroider/macros, which an Ember app's babel compiles
// away. Outside an app it throws, so the unit tests stand in for it; the Ember example apps
// exercise the real build.
export default defineConfig({
  resolve: {
    alias: {
      '@embroider/macros': fileURLToPath(new URL('tests/embroider-macros.ts', import.meta.url)),
    },
  },
  test: { server: { deps: { inline: [/@warp-drive/] } } },
})
