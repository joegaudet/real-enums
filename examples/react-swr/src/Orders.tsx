import { useState } from 'react'

import { OrderState, type Order } from './order-state'

export function Orders({
  orders,
  onAdvance,
}: {
  orders: Order[]
  onAdvance: (order: Order) => void
}) {
  const [filter, setFilter] = useState('')
  const shown = filter
    ? orders.filter(order => order.state === OrderState.valueFor(filter))
    : orders
  const states: OrderState[] = OrderState.values

  return (
    <main>
      <h1>Orders</h1>
      <label>
        State{' '}
        <select value={filter} onChange={event => setFilter(event.target.value)}>
          <option value="">All</option>
          {states.map(state => (
            <option key={state.value} value={state.value}>
              {state.label}
            </option>
          ))}
        </select>
      </label>
      <ul>
        {shown.map(order => (
          <li key={order.id} className={order.state.isCancelled ? 'muted' : ''}>
            <span>
              #{order.id} {order.customer}
            </span>
            <span className={order.state.className}>{order.state.label}</span>
            {order.state.advanceLabel && (
              <button onClick={() => onAdvance(order)}>{order.state.advanceLabel}</button>
            )}
          </li>
        ))}
      </ul>
      <details>
        <summary>As JSON</summary>
        <pre>{JSON.stringify(orders, null, 2)}</pre>
      </details>
    </main>
  )
}
