# @real-enums/urql

[real-enums](https://joegaudet.com/real-enums/) for urql's Graphcache: a resolver that reads
enums out of the cache.

```bash
npm install real-enums @real-enums/urql
```

```ts
import { cacheExchange } from '@urql/exchange-graphcache'
import { enumResolver } from '@real-enums/urql'

const client = new Client({
  url: '/graphql',
  exchanges: [
    cacheExchange({ resolvers: { Order: { state: enumResolver(OrderState) } } }),
    fetchExchange,
  ],
})
```

The cache keeps the raw value; only reads see instances. List fields map element by element.
With urql's default document cache, map results yourself with
[`mapFields`](https://github.com/joegaudet/real-enums/tree/main/packages/real-enums#mapfieldsdata-map).
