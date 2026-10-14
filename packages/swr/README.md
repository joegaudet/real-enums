# @real-enums/swr

[real-enums](https://joegaudet.com/real-enums/) for SWR: wrap a fetcher so its data arrives
as enum instances, typed.

```bash
npm install real-enums @real-enums/swr
```

```ts
import { withEnums } from '@real-enums/swr'

const fetchOrders = withEnums<Order[]>(fetchJson, { state: OrderState })

const { data } = useSWR('/api/orders', fetchOrders) // data: Order[] | undefined
```

Enum instances are singletons, so SWR's comparison sees a revalidation with the same payload as
unchanged and keeps the same object. SWR 2 passes the whole key as one argument, so for an
array key name it as one tuple: `withEnums<Order, [[string, number]]>(fetcher, map)` with
`useSWR(['/orders', 1], ...)`.

Mapping happens in the fetcher, so the SWR cache holds instances. A persistent cache provider
that serializes to JSON will store raw strings; map again on the way back in (`mapFields` is a
no-op on data that is already mapped).
