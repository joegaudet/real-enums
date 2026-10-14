# @real-enums/tanstack-query

[real-enums](https://joegaudet.com/real-enums/) for TanStack Query: a `select` that turns
wire values into enum instances.

```bash
npm install real-enums @real-enums/tanstack-query
```

```ts
import { enumSelect } from '@real-enums/tanstack-query'

// Outside the component, so TanStack does not re-run it every render.
const selectOrders = enumSelect<Order[]>({ state: OrderState, 'lines.status': LineStatus })

const { data } = useQuery({ queryKey: ['orders'], queryFn: fetchOrders, select: selectOrders })
data?.[0]?.state === OrderState.Pending
```

Mapping happens on read, so the cache keeps the raw payload: `dehydrate`, persisters and
devtools all see plain JSON. Enum instances are singletons, so structural sharing keeps the
selected data referentially stable when a refetch returns the same payload.

Paths and array handling are those of
[`mapFields`](https://github.com/joegaudet/real-enums/tree/main/packages/real-enums#mapfieldsdata-map).
Works with any TanStack Query adapter (React, Vue, Solid, Svelte, Angular): it is only a function.
