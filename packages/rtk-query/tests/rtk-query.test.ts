import { configureStore } from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query'
import { Enum } from 'real-enums'
import { afterEach, expect, test, vi } from 'vitest'

import { enumResponse, isSerializable } from '../src/index.js'

class OrderState extends Enum {
  static Open = new OrderState('open')
}

interface Order {
  id: number
  state: OrderState
}

const fetchFn = async () =>
  new Response(JSON.stringify({ id: 1, state: 'open' }), {
    headers: { 'content-type': 'application/json' },
  })

function setup(serializableCheck: object) {
  const api = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: 'http://test', fetchFn }),
    endpoints: build => ({
      order: build.query<Order, number>({
        query: id => `/orders/${id}`,
        transformResponse: enumResponse<Order>({ state: OrderState }),
      }),
    }),
  })
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: getDefault => getDefault({ serializableCheck }).concat(api.middleware),
  })
  return { api, store }
}

afterEach(() => vi.restoreAllMocks())

test('transformResponse stores enum instances', async () => {
  const { api, store } = setup({ isSerializable })
  const { data } = await store.dispatch(api.endpoints.order.initiate(1))
  expect(data!.state).toBe(OrderState.Open)
})

test('without isSerializable, the default check reports the enum', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  const { api, store } = setup({})
  await store.dispatch(api.endpoints.order.initiate(1))
  expect(error.mock.calls.flat().join(' ')).toMatch(/non-serializable/i)
})

test('with isSerializable, the check stays quiet', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  const { api, store } = setup({ isSerializable })
  await store.dispatch(api.endpoints.order.initiate(1))
  expect(error.mock.calls.flat().join(' ')).not.toMatch(/non-serializable/i)
})

test('immer does not freeze the shared singletons', async () => {
  const { api, store } = setup({ isSerializable })
  await store.dispatch(api.endpoints.order.initiate(1))
  expect(Object.isFrozen(OrderState.Open)).toBe(false)
})

test('isSerializable still rejects what the default rejects', () => {
  expect(isSerializable(new Map())).toBe(false)
  expect(isSerializable(OrderState.Open)).toBe(true)
  expect(isSerializable({ a: [1, 'x'] })).toBe(true)
})
