import { readFileSync } from 'node:fs'

import { expect, test } from 'vitest'

// The README and the site show the fixture's OrderState verbatim, so every snippet of it is
// code that readme.test.ts runs.

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8')

const classBlock = (source: string) => {
  const match = /export class OrderState extends Enum \{\n[\s\S]*?\n\}\n/.exec(source)
  if (!match) throw new Error('no OrderState class found')
  return match[0]
}

const unescapeHtml = (html: string) =>
  html
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&amp;', '&')

const fixture = classBlock(read('./fixtures/order-state.ts'))

test('the README shows the tested OrderState', () => {
  expect(classBlock(read('../README.md'))).toBe(fixture)
})

test('the site shows the tested OrderState', () => {
  expect(classBlock(unescapeHtml(read('../../../docs/site/index.html')))).toBe(fixture)
})
