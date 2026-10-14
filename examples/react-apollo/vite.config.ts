import react from '@vitejs/plugin-react'
import { transform } from 'esbuild'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

// Vite 8 leaves standard decorators (`@is() accessor isPending!: boolean`) in place, and
// browsers cannot run them yet, so esbuild lowers them before anything else sees the file.
const decorators: Plugin = {
  name: 'lower-decorators',
  enforce: 'pre',
  async transform(code, id) {
    if (!/\.tsx?$/.test(id) || !code.includes('accessor ')) return null
    const out = await transform(code, {
      loader: id.endsWith('x') ? 'tsx' : 'ts',
      target: 'es2022',
      jsx: 'preserve',
      sourcefile: id,
      sourcemap: true,
    })
    return { code: out.code, map: out.map }
  },
}

export default defineConfig({
  plugins: [decorators, react()],
  test: { environment: 'jsdom' },
})
