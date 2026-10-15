import { QueryClient, QueryObserver, dehydrate } from '@tanstack/query-core'
import { Enum } from '@real-enums/core'
import { afterEach, expect, test } from 'vitest'

import { enumSelect } from '../src/index.js'

class OrderState extends Enum {
  static Open = new OrderState('open')
  static Shipped = new OrderState('shipped')
}

interface Order {
  id: number
  state: OrderState
  lines: { state: OrderState }[]
}

const wire = () => ({ id: 1, state: 'open', lines: [{ state: 'shipped' }] })
const client = new QueryClient()
afterEach(() => client.clear())

function observe() {
  return new QueryObserver(client, {
    queryKey: ['order', 1],
    queryFn: async () => wire(),
    select: enumSelect<Order>({ state: OrderState, 'lines.state': OrderState }),
  })
}

async function settled(observer: ReturnType<typeof observe>) {
  const unsubscribe = observer.subscribe(() => {})
  await client.refetchQueries({ queryKey: ['order', 1] })
  unsubscribe()
  return observer.getCurrentResult().data!
}

test('select hands the component enum instances', async () => {
  const order = await settled(observe())
  expect(order.state).toBe(OrderState.Open)
  expect(order.lines[0]!.state).toBe(OrderState.Shipped)
})

test('a refetch with the same payload keeps the same object, so nothing re-renders', async () => {
  const observer = observe()
  const first = await settled(observer)
  const second = await settled(observer)
  expect(second).toBe(first)
})

test('the cache keeps the raw payload, so dehydrate and persisters see plain JSON', async () => {
  await settled(observe())
  expect(JSON.stringify(dehydrate(client))).toContain('"state":"open"')
  expect(client.getQueryData(['order', 1])).toEqual(wire())
})
