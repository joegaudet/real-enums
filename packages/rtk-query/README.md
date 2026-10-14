# @real-enums/rtk-query

[real-enums](https://joegaudet.com/real-enums/) for RTK Query: a `transformResponse`, and a
serializable check that accepts enums.

```bash
npm install real-enums @real-enums/rtk-query
```

```ts
import { enumResponse, isSerializable } from '@real-enums/rtk-query'

const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: build => ({
    orders: build.query<Order[], void>({
      query: () => '/orders',
      transformResponse: enumResponse<Order[]>({ state: OrderState }),
    }),
  }),
})

const store = configureStore({
  reducer: { [api.reducerPath]: api.reducer },
  middleware: getDefault =>
    getDefault({ serializableCheck: { isSerializable } }).concat(api.middleware),
})
```

Without `isSerializable`, Redux Toolkit's development check reports every enum in the store as
non-serializable. It is Redux Toolkit's own `isPlain` plus enum instances, which serialize to
their raw value. Immer does not freeze the shared instances.

It applies to the whole store, so enums can end up in ordinary slices too. Anything that
rehydrates state (redux-persist, a DevTools import) brings back the raw strings, not the
instances: run `mapFields` over rehydrated state before relying on `===` or the getters.

`transformResponse` applies to `query` endpoints only, as in RTK Query itself; a `queryFn` maps
its own result with `mapFields`.
