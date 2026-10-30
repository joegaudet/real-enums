import { expect, test } from 'vitest'

import { Enum, mapFields, realEnum } from '../src/index.js'

import { OrderState } from './fixtures/order-state.js'

// The README's claims, run. If one of these changes, the README changes with it.

test('instances compare loosely with, interpolate as, and stringify to the raw value', () => {
  // Loose equality is the claim under test.
  expect(OrderState.Pending == ('pending' as unknown)).toBe(true)
  expect(`${OrderState.Pending}`).toBe('pending')
  expect(JSON.stringify(OrderState.Pending)).toBe('"pending"')
})

test('label and id', () => {
  expect(OrderState.Pending.label).toBe('Pending')
  expect(OrderState.Pending.id).toBe(OrderState.Pending)
})

test('@is() and @isNot() answer for their own member only', () => {
  expect(
    OrderState.values.map((s: OrderState) => [s.isPending, s.isCancelled, s.isNotCancelled]),
  ).toEqual([
    [true, false, true],
    [false, false, true],
    [false, false, true],
    [false, true, false],
  ])
})

test('next and advanceLabel are lookups keyed by value, undefined where there is no entry', () => {
  expect(OrderState.values.map((s: OrderState) => [s.next, s.advanceLabel])).toEqual([
    [OrderState.Shipped, 'Ship'],
    [OrderState.Delivered, 'Deliver'],
    [undefined, undefined],
    [undefined, undefined],
  ])
})

test('className', () => {
  expect(OrderState.Cancelled.className).toBe('badge badge--cancelled')
})

test('codec', () => {
  const { parse, serialize } = OrderState.codec()
  expect([parse('pending'), parse('archived'), parse(null)]).toEqual([
    OrderState.Pending,
    undefined,
    undefined,
  ])
  expect([serialize(OrderState.Pending), serialize('pending'), serialize(undefined)]).toEqual([
    'pending',
    'pending',
    null,
  ])
})

test('mapFields with a leaf array', () => {
  class Tag extends Enum {
    static New = new Tag('new')
  }
  expect(mapFields({ state: 'shipped', tags: ['new'] }, { state: OrderState, tags: Tag })).toEqual({
    state: OrderState.Shipped,
    tags: [Tag.New],
  })
})

test('realEnum', () => {
  expect(realEnum(OrderState)['~standard'].validate('pending')).toEqual({
    value: OrderState.Pending,
  })
  expect(realEnum(OrderState)['~standard'].validate('nope')).toEqual({
    issues: [{ message: 'Expected one of: pending, shipped, delivered, cancelled' }],
  })
})

test('match: grouped cases, exhaustive, and the otherwise catch-all', () => {
  const statusText = (state: OrderState) =>
    OrderState.match(state)
      .when([OrderState.Pending, OrderState.Shipped], () => 'In progress')
      .when([OrderState.Delivered], () => 'Done')
      .when([OrderState.Cancelled], () => 'Cancelled')
      .exhaustive()

  const canEdit = (state: OrderState) =>
    OrderState.match(state)
      .when([OrderState.Pending], () => true)
      .otherwise(() => false)

  expect(OrderState.values.map(statusText)).toEqual([
    'In progress',
    'In progress',
    'Done',
    'Cancelled',
  ])
  expect(OrderState.values.map(canEdit)).toEqual([true, false, false, false])
})
