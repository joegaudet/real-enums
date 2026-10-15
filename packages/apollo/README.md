# @real-enums/apollo

[real-enums](https://joegaudet.com/real-enums/) for Apollo Client: a field policy that reads
enums out of the normalized cache.

```bash
npm install @real-enums/core @real-enums/apollo
```

```ts
import { enumField } from '@real-enums/apollo'

const cache = new InMemoryCache({
  typePolicies: {
    Order: { fields: { state: enumField(OrderState), history: enumField(OrderState) } },
  },
})
```

Reads return instances, for scalar and list fields alike. Writes store the raw value, so the
cache (and anything that persists it) stays plain JSON, whether the write came from the network
or from `writeQuery` with an instance. Pass an enum as a variable and it is sent as its raw value.

In development Apollo deep-freezes query results, and that reaches the shared enum instances.
Everything real-enums does still works on a frozen instance; avoid enum classes that write to
`this` after construction.
