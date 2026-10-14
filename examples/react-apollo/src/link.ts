import { ApolloLink } from '@apollo/client'
import { from } from 'rxjs'

import { fetchOrders, updateOrder } from './api'

type Row = Record<string, unknown>

// Answers the two operations from the stand-in API, so the Apollo setup in App.tsx is the one a
// real app would use against a real GraphQL server.
export const link = new ApolloLink(operation =>
  from(
    (async () => {
      if (operation.operationName === 'AdvanceOrder') {
        const { id, state } = operation.variables as { id: number; state: string }
        const order = (await updateOrder(id, { state })) as Row
        return { data: { advanceOrder: { __typename: 'Order', ...order } } }
      }
      const orders = (await fetchOrders()) as Row[]
      return { data: { orders: orders.map(order => ({ __typename: 'Order', ...order })) } }
    })(),
  ),
)
