import { Client, gql, makeResult, type Exchange } from '@urql/core'
import { cacheExchange } from '@urql/exchange-graphcache'
import { Enum } from 'real-enums'
import { expect, test } from 'vitest'
import { filter, map, pipe } from 'wonka'

import { enumResolver } from '../src/index.js'

class OrderState extends Enum {
  static Open = new OrderState('open')
  static Shipped = new OrderState('shipped')
}

const ORDER = gql`
  query {
    order(id: 1) {
      id
      state
      history
    }
  }
`

let calls = 0
const serve =
  (order: object): Exchange =>
  () =>
  ops$ =>
    pipe(
      ops$,
      filter(op => op.kind === 'query'),
      map(op => {
        calls++
        return makeResult(op, { data: { order } })
      }),
    )

function client(
  order: object = { __typename: 'Order', id: 1, state: 'open', history: ['open', 'shipped'] },
) {
  return new Client({
    url: 'http://test/graphql',
    exchanges: [
      cacheExchange({
        resolvers: {
          Order: { state: enumResolver(OrderState), history: enumResolver(OrderState) },
        },
      }),
      serve(order),
    ],
  })
}

test('reads come back as enum instances, arrays included', async () => {
  const { data } = await client().query(ORDER, {}).toPromise()
  expect(data.order.state).toBe(OrderState.Open)
  expect(data.order.history).toEqual([OrderState.Open, OrderState.Shipped])
})

test('a null or unknown value reads as null, not as a cache miss that wipes the result', async () => {
  calls = 0
  const c = client({ __typename: 'Order', id: 2, state: null, history: ['archived', 'open'] })
  const { data } = await c.query(ORDER, {}).toPromise()
  expect(data.order.state).toBeNull()
  expect(data.order.history).toEqual([null, OrderState.Open])
  const again = await c.query(ORDER, {}).toPromise()
  expect(again.data.order.state).toBeNull()
  expect(calls).toBe(1)
})
