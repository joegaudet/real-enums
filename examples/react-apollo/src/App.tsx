import { ApolloClient, InMemoryCache, gql, type TypedDocumentNode } from '@apollo/client'
import { ApolloProvider, useMutation, useQuery } from '@apollo/client/react'
import { enumField } from '@real-enums/apollo'
import { useState } from 'react'

import { link } from './link'
import { OrderState, type Order } from './order-state'
import { Orders } from './Orders'

const ORDERS: TypedDocumentNode<{ orders: Order[] }> = gql`
  query Orders {
    orders {
      id
      customer
      state
    }
  }
`

const ADVANCE: TypedDocumentNode<{ advanceOrder: Order }, { id: number; state: OrderState }> = gql`
  mutation AdvanceOrder($id: Int!, $state: String!) {
    advanceOrder(id: $id, state: $state) {
      id
      state
    }
  }
`

function makeClient() {
  return new ApolloClient({
    link,
    cache: new InMemoryCache({
      // Reads return enums; the normalized cache keeps the raw strings.
      typePolicies: { Order: { fields: { state: enumField(OrderState) } } },
    }),
  })
}

function OrdersPage() {
  const { data } = useQuery(ORDERS)
  // The mutation's result lands in the normalized cache, so the list updates without a refetch.
  const [advance] = useMutation(ADVANCE)
  return (
    <Orders
      orders={data?.orders ?? []}
      onAdvance={order => advance({ variables: { id: order.id, state: order.state.next! } })}
    />
  )
}

export function App() {
  const [client] = useState(makeClient)
  return (
    <ApolloProvider client={client}>
      <OrdersPage />
    </ApolloProvider>
  )
}
