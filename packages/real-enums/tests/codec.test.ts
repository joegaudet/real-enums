import { expect, test } from 'vitest'

import { Enum } from '../src/index.js'

class Color extends Enum {
  static Red = new Color('red')
  static Blue = new Color('blue')
}

const codec = Color.codec()

test('parse turns a raw value into its instance', () => {
  expect(codec.parse('red')).toBe(Color.Red)
})

test('parse is lenient: unknown or missing values become undefined rather than throwing', () => {
  expect(codec.parse('green')).toBeUndefined()
  expect(codec.parse(null)).toBeUndefined()
  expect(codec.parse(undefined)).toBeUndefined()
})

test('serialize writes the raw value, and null for nothing', () => {
  expect(codec.serialize(Color.Blue)).toBe('blue')
  expect(codec.serialize(undefined)).toBeNull()
  expect(codec.serialize(null)).toBeNull()
})

test('serialize passes a raw value through, so writes from the wire and from the app both work', () => {
  expect(codec.serialize('red')).toBe('red')
})

test('parse and serialize do not depend on `this`, so they can be passed around', () => {
  const { parse, serialize } = codec
  expect(serialize(parse('red'))).toBe('red')
})
