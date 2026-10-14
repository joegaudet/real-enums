import { expect, test } from 'vitest'

import { Enum, mapFields } from '../src/index.js'

class State extends Enum {
  static Open = new State('open')
  static Closed = new State('closed')
}

class Tier extends Enum {
  static Gold = new Tier('gold')
}

test('maps a top-level field', () => {
  expect(mapFields({ id: 1, state: 'open' }, { state: State })).toEqual({
    id: 1,
    state: State.Open,
  })
})

test('maps a dotted path', () => {
  const out = mapFields<{ customer: { tier: Tier } }>(
    { customer: { tier: 'gold' } },
    { 'customer.tier': Tier },
  )
  expect(out.customer.tier).toBe(Tier.Gold)
})

test('arrays are transparent, at the root and along the path', () => {
  const out = mapFields<{ items: { state: State }[] }[]>(
    [{ items: [{ state: 'open' }, { state: 'closed' }] }],
    { 'items.state': State },
  )
  expect(out[0]!.items.map(i => i.state)).toEqual([State.Open, State.Closed])
})

test('a leaf that is an array of raw values becomes an array of instances', () => {
  expect(mapFields({ states: ['open', 'closed'] }, { states: State })).toEqual({
    states: [State.Open, State.Closed],
  })
})

test('missing paths and nulls are left alone', () => {
  expect(mapFields({ customer: null }, { 'customer.tier': Tier })).toEqual({ customer: null })
  expect(mapFields({}, { state: State })).toEqual({})
})

test('unknown values become undefined, like valueFor', () => {
  expect(mapFields({ state: 'archived' }, { state: State })).toEqual({ state: undefined })
})

test('does not mutate its input', () => {
  const raw = { order: { state: 'open' } }
  mapFields(raw, { 'order.state': State })
  expect(raw).toEqual({ order: { state: 'open' } })
})

test('mapping already-mapped data is a no-op', () => {
  const once = mapFields({ state: 'open' }, { state: State })
  expect(mapFields(once, { state: State })).toEqual(once)
})

test('several fields at once', () => {
  expect(
    mapFields(
      { state: 'closed', customer: { tier: 'gold' } },
      { state: State, 'customer.tier': Tier },
    ),
  ).toEqual({ state: State.Closed, customer: { tier: Tier.Gold } })
})
