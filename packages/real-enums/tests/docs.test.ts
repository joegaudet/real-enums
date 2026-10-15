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

test('the guide shows the tested OrderState', () => {
  expect(classBlock(unescapeHtml(read('../../../docs/site/guide/index.html')))).toBe(fixture)
})

test('llms.txt shows the tested OrderState and the rules agents follow', () => {
  const llms = read('../../../docs/site/llms.txt')
  expect(classBlock(llms)).toBe(fixture)
  expect(llms).toContain('`Cls.of(')
  expect(llms).toContain('.exhaustive()')
})

// Link previews (Slack, X, LinkedIn, iMessage) read these. Without og:image Slack falls back to
// the SVG favicon, which it cannot render.
test('the site has link-preview meta with an absolute 1200x630 PNG card', () => {
  const site = read('../../../docs/site/index.html')
  const meta = (key: string) =>
    new RegExp(`<meta\\s+(?:property|name)="${key}"\\s+content="([^"]+)"`).exec(site)?.[1]

  const base = 'https://joegaudet.com/real-enums/'
  expect(meta('og:url')).toBe(base)
  expect(meta('og:title')).toBeTruthy()
  expect(meta('og:description')).toBeTruthy()
  expect(meta('twitter:card')).toBe('summary_large_image')
  const image = meta('og:image')!
  expect(image.startsWith(base)).toBe(true)

  const png = readFileSync(
    new URL(`../../../docs/site/${image.slice(base.length)}`, import.meta.url),
  )
  expect(png.subarray(1, 4).toString()).toBe('PNG')
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630])
})
