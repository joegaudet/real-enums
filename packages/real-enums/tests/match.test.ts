import { expect, expectTypeOf, test } from 'vitest'

import { Enum, is } from '../src/index.js'

// Every `@ts-expect-error` below is an assertion: `pnpm typecheck` fails if the line compiles.

class OrderState extends Enum {
  static Pending = OrderState.of('pending')
  static Shipped = OrderState.of('shipped')
  static Delivered = OrderState.of('delivered')
  static Cancelled = OrderState.of('cancelled')

  @is() accessor isPending!: boolean
}

const statusText = (state: OrderState) =>
  OrderState.match(state)
    .when([OrderState.Pending, OrderState.Shipped], () => 'In progress')
    .when([OrderState.Delivered], () => 'Done')
    .when([OrderState.Cancelled], () => 'Cancelled')
    .exhaustive()

test('of() makes ordinary members', () => {
  expect(OrderState.Shipped).toBeInstanceOf(OrderState)
  expect(OrderState.Shipped.value).toBe('shipped')
  expect(OrderState.values).toEqual([
    OrderState.Pending,
    OrderState.Shipped,
    OrderState.Delivered,
    OrderState.Cancelled,
  ])
  expect(OrderState.valueFor('shipped')).toBe(OrderState.Shipped)
  expect(OrderState.Pending.isPending).toBe(true)
})

test('exhaustive() runs the case that lists the value, grouped or alone', () => {
  expect(OrderState.values.map(statusText)).toEqual([
    'In progress',
    'In progress',
    'Done',
    'Cancelled',
  ])
})

test('otherwise() is the catch-all', () => {
  const canEdit = (state: OrderState) =>
    OrderState.match(state)
      .when([OrderState.Pending], () => true)
      .otherwise(() => false)

  expect(OrderState.values.map(canEdit)).toEqual([true, false, false, false])
})

test('the handler gets the matched value', () => {
  const seen = OrderState.match(OrderState.Shipped)
    .when([OrderState.Pending, OrderState.Shipped], state => state)
    .otherwise(() => undefined)

  expect(seen).toBe(OrderState.Shipped)
})

test('exhaustive() throws for a value from outside the enum', () => {
  const stray = new OrderState('archived')
  expect(() =>
    OrderState.match(stray)
      .when([OrderState.Pending, OrderState.Shipped, OrderState.Delivered], () => 1)
      .when([OrderState.Cancelled], () => 2)
      .exhaustive(),
  ).toThrow('OrderState has no case for "archived"')
})

test('the result type is the union of the handlers', () => {
  const result = OrderState.match(OrderState.Pending)
    .when([OrderState.Pending], () => 1)
    .otherwise(() => 'other')

  expectTypeOf(result).toEqualTypeOf<number | string>()
})

test('a missing member does not compile', () => {
  expect(() =>
    OrderState.match(OrderState.Pending)
      .when([OrderState.Pending, OrderState.Shipped], () => 1)
      .when([OrderState.Delivered], () => 2)
      // @ts-expect-error Cancelled is not handled
      .exhaustive(),
  ).not.toThrow()
})

test('handling a member twice does not compile', () => {
  OrderState.match(OrderState.Pending)
    .when([OrderState.Pending], () => 1)
    // @ts-expect-error Pending is already handled
    .when([OrderState.Pending, OrderState.Cancelled], () => 2)
})

test('a plain string is not a member', () => {
  OrderState.match(OrderState.Pending)
    // @ts-expect-error cases are static members, never strings
    .when(['pending'], () => 1)
})

test('match() refuses an enum with a member made by new', () => {
  class Mixed extends Enum {
    static A = Mixed.of('a')
    static B = new Mixed('b')
  }

  // Without the guard, handling B (typed as plain Mixed) would count as handling A too.
  // @ts-expect-error declare every member with of()
  Mixed.match(Mixed.A).when([Mixed.B], () => 1)
})

test('of() passes extra constructor arguments through', () => {
  class Icon extends Enum {
    static Open = Icon.of('open', '🟢')
    static Closed = Icon.of('closed', '⚫')

    constructor(
      value: string,
      readonly glyph: string,
    ) {
      super(value)
    }
  }

  expect(Icon.Closed.glyph).toBe('⚫')
  expect(
    Icon.match(Icon.Open)
      .when([Icon.Open], icon => icon.glyph)
      .when([Icon.Closed], () => '')
      .exhaustive(),
  ).toBe('🟢')
  // @ts-expect-error the glyph is required
  expect(() => Icon.of('half')).not.toThrow()
})

test('of() refuses a value its class already has', () => {
  class Twice extends Enum {
    static A = Twice.of('a')
  }
  // Two members with one value share a type, so handling one would count as handling both.
  expect(() => Twice.of('a')).toThrow('Twice already has a member "a"')
  expect(() => Twice.of('b')).not.toThrow()
})

test('when() takes a readonly array', () => {
  const inFlight = [OrderState.Pending, OrderState.Shipped] as const
  expect(
    OrderState.match(OrderState.Shipped)
      .when(inFlight, () => 'in flight')
      .otherwise(() => 'settled'),
  ).toBe('in flight')
})

test('a member of a subclass is not covered: exhaustive() throws for it', () => {
  // Known limit, documented: types are structural, so a subclass member type-checks as one.
  class Special extends OrderState {
    static Lost = Special.of('lost')
  }
  expect(() => statusText(Special.Lost)).toThrow('OrderState has no case for "lost"')
})
