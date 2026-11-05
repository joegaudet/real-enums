import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { expect, test } from 'vitest'

const read = (path: string) =>
  readFileSync(fileURLToPath(new URL(`../${path}`, import.meta.url)), 'utf8')
const runtimeImports = (path: string) =>
  [...read(path).matchAll(/^(?:import|export) (?!type )[^;]*? from '([^']+)'/gm)].map(m => m[1])

// An app on ember-data 5.8 can have a second @warp-drive/core installed (a 5.9 peer). If the
// enum transform loaded it, WarpDrive would throw "Multiple versions of WarpDrive detected".
test('the legacy entry loads no WarpDrive code', () => {
  for (const file of ['src/legacy.ts', 'src/codec.ts']) {
    expect(runtimeImports(file).filter(spec => spec.startsWith('@warp-drive'))).toEqual([])
  }
})

test('the enum transform the app gets comes from the legacy entry', () => {
  expect(runtimeImports('app/transforms/enum.js')).toEqual(['@real-enums/warp-drive/legacy'])
})
