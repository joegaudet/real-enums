import { enumSelect } from '@real-enums/tanstack-query'
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useState } from 'react'

import { fetchOrders, updateOrder } from './api'
import { OrderState, type Order } from './order-state'
import { Orders } from './Orders'

// Defined once, outside the component, so TanStack does not re-run it every render.
const selectOrders = enumSelect<Order[]>({ state: OrderState })

function OrdersPage() {
  const queryClient = useQueryClient()
  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    select: selectOrders,
  })
  const advance = useMutation({
    // `state` is an enum; JSON.stringify sends its raw value.
    mutationFn: (order: Order) => updateOrder(order.id, { state: order.state.next }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
  return <Orders orders={orders} onAdvance={order => advance.mutate(order)} />
}

export function App() {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <OrdersPage />
    </QueryClientProvider>
  )
}
