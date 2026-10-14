// A stand-in for a JSON API. Everything that crosses it is round-tripped through JSON, exactly
// as it would be over a network: the app sends and receives plain strings, never enums.

const seed = [
  { id: 1001, customer: 'Ada Lovelace', state: 'pending' },
  { id: 1002, customer: 'Grace Hopper', state: 'shipped' },
  { id: 1003, customer: 'Katherine Johnson', state: 'delivered' },
  { id: 1004, customer: 'Alan Turing', state: 'cancelled' },
]

let db = structuredClone(seed)

const wire = (value: unknown): unknown => JSON.parse(JSON.stringify(value))

export function resetApi() {
  db = structuredClone(seed)
}

export async function fetchOrders(): Promise<unknown> {
  return wire(db)
}

export async function updateOrder(id: number, patch: object): Promise<unknown> {
  const order = db.find(o => o.id === id)
  if (!order) throw new Error(`No order ${id}`)
  Object.assign(order, wire(patch))
  return wire(order)
}
