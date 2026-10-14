import { withEnums } from '@real-enums/swr'
import useSWR, { SWRConfig } from 'swr'

import { fetchOrders, updateOrder } from './api'
import { OrderState, type Order } from './order-state'
import { Orders } from './Orders'

// The fetcher does the mapping, so `data` is typed Order[] and holds enum instances.
const fetchOrdersWithEnums = withEnums<Order[]>(fetchOrders, { state: OrderState })

function OrdersPage() {
  const { data: orders = [], mutate } = useSWR('/orders', fetchOrdersWithEnums)
  async function advance(order: Order) {
    // `state` is an enum; JSON.stringify sends its raw value.
    await updateOrder(order.id, { state: order.state.next })
    await mutate()
  }
  return <Orders orders={orders} onAdvance={advance} />
}

export function App() {
  return (
    <SWRConfig value={{ provider: () => new Map() }}>
      <OrdersPage />
    </SWRConfig>
  )
}
