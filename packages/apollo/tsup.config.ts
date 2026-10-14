import { defineConfig } from 'tsup'

// JS only: `tsc --build` writes the declarations next to it.
export default defineConfig({
  entry: ['src/index.ts'],
  // ESM only: every target loads it, Node 22 included (`require(esm)`).
  format: ['esm'],
  target: 'es2022',
  dts: false,
  sourcemap: true,
  clean: false,
  treeshake: true,
})
