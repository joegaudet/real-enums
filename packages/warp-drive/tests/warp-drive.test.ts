import { Type } from '@warp-drive/core/types/symbols'
import { Enum } from 'real-enums'
import { expect, test } from 'vitest'

import { enumTransform, enumTransformation } from '../src/index.js'

class OrderState extends Enum {
  static Open = new OrderState('open')
  static Shipped = new OrderState('shipped')
}

// WarpDrive passes options and the record; these transforms ignore both.
const options = null
const record = {} as Parameters<ReturnType<typeof enumTransformation>['hydrate']>[2]

test('the transformation is registered under the name it is given', () => {
  expect(enumTransformation(OrderState, 'order-state')[Type]).toBe('order-state')
})

test('the transformation hydrates raw values and serializes instances', () => {
  const t = enumTransformation(OrderState, 'order-state')
  expect(t.hydrate('open', options, record)).toBe(OrderState.Open)
  expect(t.serialize(OrderState.Shipped, options, record)).toBe('shipped')
})

test('the transformation passes nothing through as nothing', () => {
  const t = enumTransformation(OrderState, 'order-state')
  expect(t.hydrate(undefined, options, record)).toBeUndefined()
  expect(t.hydrate(null, options, record)).toBeUndefined()
  expect(t.serialize(undefined, options, record)).toBeNull()
})

test('the transformation maps arrays element by element', () => {
  const t = enumTransformation(OrderState, 'order-state')
  expect(t.hydrate(['open', 'shipped'], options, record)).toEqual([
    OrderState.Open,
    OrderState.Shipped,
  ])
  expect(t.serialize([OrderState.Open], options, record)).toEqual(['open'])
})

test('the legacy transform is created the way ember-data creates transforms', () => {
  const Transform = enumTransform(OrderState)
  const transform = Transform.create()
  expect(transform.deserialize('open')).toBe(OrderState.Open)
  expect(transform.serialize(OrderState.Open)).toBe('open')
  expect(transform.deserialize(['open', 'nope'])).toEqual([OrderState.Open, undefined])
  expect(transform.serialize(null)).toBeNull()
})
