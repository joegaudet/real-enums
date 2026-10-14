import { expect, test } from 'vitest'

import { Enum, realEnum } from '../src/index.js'

class Size extends Enum {
  static Small = new Size('small')
  static Large = new Size('large')
}

const schema = realEnum(Size)

test('declares Standard Schema v1', () => {
  expect(schema['~standard'].version).toBe(1)
  expect(schema['~standard'].vendor).toBe('real-enums')
})

test('a raw value validates to its instance', () => {
  expect(schema['~standard'].validate('small')).toEqual({ value: Size.Small })
})

test('an instance validates to itself', () => {
  expect(schema['~standard'].validate(Size.Large)).toEqual({ value: Size.Large })
})

test('anything else is an issue naming the allowed values', () => {
  for (const bad of ['medium', 3, null, undefined]) {
    expect(schema['~standard'].validate(bad)).toEqual({
      issues: [{ message: 'Expected one of: small, large' }],
    })
  }
})
