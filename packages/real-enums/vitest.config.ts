import { transform } from 'esbuild'
import { defineConfig } from 'vitest/config'

// Vite 8 leaves TC39 decorators and `accessor` in place, and Node cannot parse them, so the
// tests that use @is()/@isNot() are lowered with esbuild first.
export default defineConfig({
  plugins: [
    {
      name: 'lower-decorators',
      enforce: 'pre',
      async transform(code, id) {
        if (!/\.ts$/.test(id) || !code.includes('accessor ')) return null
        const out = await transform(code, {
          loader: 'ts',
          target: 'es2022',
          sourcefile: id,
          sourcemap: true,
        })
        return { code: out.code, map: out.map }
      },
    },
  ],
})
