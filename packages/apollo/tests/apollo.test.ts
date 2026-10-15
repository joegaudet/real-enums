import { ApolloClient, ApolloLink, InMemoryCache, gql } from '@apollo/client'
import { Enum } from '@real-enums/core'
import { of } from 'rxjs'
import { expect, test } from 'vitest'

import { enumField } from '../src/index.js'

class OrderState extends Enum {
  static Open = new OrderState('open')
  static Shipped = new OrderState('shipped')

  get isOpen() {
    return this === OrderState.Open
  }
}

const ORDER = gql`
  query Order {
    order(id: 1) {
      id
      state
      history
    }
  }
`

function client() {
  const link = new ApolloLink(() =>
    of({
      data: { order: { __typename: 'Order', id: 1, state: 'open', history: ['open', 'shipped'] } },
    }),
  )
  const cache = new InMemoryCache({
    typePolicies: {
      Order: { fields: { state: enumField(OrderState), history: enumField(OrderState) } },
    },
  })
  return new ApolloClient({ link, cache })
}

test('reads come back as enum instances, arrays included', async () => {
  const { data } = await client().query<{ order: { state: OrderState; history: OrderState[] } }>({
    query: ORDER,
  })
  expect(data!.order.state).toBe(OrderState.Open)
  expect(data!.order.history).toEqual([OrderState.Open, OrderState.Shipped])
})

test('instances still work after Apollo freezes the result', async () => {
  const { data } = await client().query<{ order: { state: OrderState } }>({ query: ORDER })
  expect(data!.order.state.isOpen).toBe(true)
  expect(OrderState.Shipped.isOpen).toBe(false)
})

test('the normalized cache holds raw values, even when an instance is written', async () => {
  const c = client()
  await c.query({ query: ORDER })
  c.cache.writeFragment({
    id: 'Order:1',
    fragment: gql`
      fragment S on Order {
        state
      }
    `,
    data: { state: OrderState.Shipped },
  })
  const stored = (c.cache.extract() as Record<string, { state: unknown }>)['Order:1']!
  expect(typeof stored.state).toBe('string')
  const { data } = await c.query<{ order: { state: OrderState } }>({
    query: ORDER,
    fetchPolicy: 'cache-only',
  })
  expect(data!.order.state).toBe(OrderState.Shipped)
})

test('in development Apollo deep-freezes results, singletons included, and they keep working', async () => {
  await client().query({ query: ORDER })
  expect(Object.isFrozen(OrderState.Open)).toBe(true)
  expect(OrderState.Open.isOpen).toBe(true)
  expect(OrderState.valueFor('open')).toBe(OrderState.Open)
})

test('a null or unknown value reads as null, so Apollo still sees the field as present', async () => {
  const link = new ApolloLink(() =>
    of({
      data: { order: { __typename: 'Order', id: 2, state: null, history: ['archived', 'open'] } },
    }),
  )
  let calls = 0
  const counting = new ApolloLink((operation, forward) => {
    calls++
    return forward(operation)
  })
  const c = new ApolloClient({
    link: counting.concat(link),
    cache: new InMemoryCache({
      typePolicies: {
        Order: { fields: { state: enumField(OrderState), history: enumField(OrderState) } },
      },
    }),
  })
  const first = await c.query<{
    order: { state: OrderState | null; history: (OrderState | null)[] }
  }>({
    query: ORDER,
  })
  expect(first.data!.order.state).toBeNull()
  expect(first.data!.order.history).toEqual([null, OrderState.Open])
  const cached = await c.query<{ order: { state: OrderState | null } }>({
    query: ORDER,
    fetchPolicy: 'cache-only',
  })
  expect(cached.data!.order.state).toBeNull()
  await c.query({ query: ORDER })
  expect(calls).toBe(1)
})
