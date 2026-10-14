import { enumResponse, isSerializable } from '@real-enums/rtk-query'
import { configureStore } from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { useState } from 'react'
import { Provider } from 'react-redux'

import { fakeFetch } from './fetch'
import { OrderState, type Order } from './order-state'
import { Orders } from './Orders'

const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.example.test', fetchFn: fakeFetch }),
  tagTypes: ['Order'],
  endpoints: build => ({
    orders: build.query<Order[], void>({
      query: () => '/orders',
      transformResponse: enumResponse<Order[]>({ state: OrderState }),
      providesTags: ['Order'],
    }),
    advance: build.mutation<unknown, Order>({
      // `state` is an enum; fetchBaseQuery's JSON.stringify sends its raw value.
      query: order => ({
        url: `/orders/${order.id}`,
        method: 'PATCH',
        body: { state: order.state.next },
      }),
      invalidatesTags: ['Order'],
    }),
  }),
})

function makeStore() {
  return configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: getDefault =>
      // Enums in the store are fine: they serialize to their raw value.
      getDefault({ serializableCheck: { isSerializable } }).concat(api.middleware),
  })
}

function OrdersPage() {
  const { data: orders = [] } = api.useOrdersQuery()
  const [advance] = api.useAdvanceMutation()
  return <Orders orders={orders} onAdvance={order => advance(order)} />
}

export function App() {
  const [store] = useState(makeStore)
  return (
    <Provider store={store}>
      <OrdersPage />
    </Provider>
  )
}
