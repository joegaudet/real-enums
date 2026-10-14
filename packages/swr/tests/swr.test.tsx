import { renderHook, waitFor } from '@testing-library/react'
import { Enum } from 'real-enums'
import type { ReactNode } from 'react'
import useSWR, { SWRConfig } from 'swr'
import { expect, test } from 'vitest'

import { withEnums } from '../src/index.js'

class OrderState extends Enum {
  static Open = new OrderState('open')
  static Shipped = new OrderState('shipped')
}

interface Order {
  id: number
  state: OrderState
}

const fetchJson = async (_url: string) => ({ id: 1, state: 'open' })
const fetchOrder = withEnums<Order, [string]>(fetchJson, { state: OrderState })

const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>
)

test('data arrives as enum instances, typed', async () => {
  const { result } = renderHook(() => useSWR('/orders/1', fetchOrder), { wrapper })
  await waitFor(() => expect(result.current.data).toBeDefined())
  const order: Order = result.current.data!
  expect(order.state).toBe(OrderState.Open)
})

test('revalidating with the same payload keeps the same object', async () => {
  const { result } = renderHook(() => useSWR('/orders/1', fetchOrder), { wrapper })
  await waitFor(() => expect(result.current.data).toBeDefined())
  const first = result.current.data
  await result.current.mutate()
  expect(result.current.data).toBe(first)
})

test('the wrapped fetcher passes its arguments through', async () => {
  const seen: string[] = []
  const fetcher = withEnums<Order, [string]>(
    async url => {
      seen.push(url)
      return { id: 2, state: 'shipped' }
    },
    { state: OrderState },
  )
  expect((await fetcher('/orders/2')).state).toBe(OrderState.Shipped)
  expect(seen).toEqual(['/orders/2'])
})

test('an array key reaches the fetcher as one tuple, as the README says', async () => {
  const fetchLine = withEnums<Order, [[string, number]]>(
    async ([url, id]) => ({ id, state: url === '/orders' ? 'shipped' : 'open' }),
    { state: OrderState },
  )
  const { result } = renderHook(() => useSWR(['/orders', 7], fetchLine), { wrapper })
  await waitFor(() => expect(result.current.data).toBeDefined())
  expect(result.current.data).toEqual({ id: 7, state: OrderState.Shipped })
})
