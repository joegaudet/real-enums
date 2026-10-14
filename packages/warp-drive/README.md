# @real-enums/warp-drive

[real-enums](https://joegaudet.com/real-enums/) for WarpDrive and ember-data: a schema
Transformation for schema records, and a transform for `@attr` on legacy Models.

```bash
npm install real-enums @real-enums/warp-drive
```

Works with `@warp-drive/core` 5.8 and later (ember-data 5.8+). Nothing here imports Ember, so
it builds in any Embroider/Vite or classic app.

## Schema records

Register a Transformation under a name, then use that name as the field's `type`. The cache
keeps the raw string; the record reads the enum.

```ts
// app/services/store.ts
import { useRecommendedStore } from '@warp-drive/core'
import { JSONAPICache } from '@warp-drive/json-api'
import { enumTransformation } from '@real-enums/warp-drive'

export default useRecommendedStore({
  cache: JSONAPICache,
  schemas: [OrderSchema],
  transformations: [enumTransformation(OrderState, 'order-state')],
})

// app/schemas/order.ts
export const OrderSchema = withDefaults({
  type: 'order',
  fields: [{ kind: 'field', name: 'state', type: 'order-state' }],
})
```

The name is required rather than derived from the class, because minifiers rename classes.

## Legacy Models

```ts
// app/transforms/order-state.ts
import { enumTransform } from '@real-enums/warp-drive'
export default enumTransform(OrderState)

// app/models/order.ts
export default class Order extends Model {
  @attr('order-state') declare state: OrderState
}
```

Legacy transforms run in the serializer, so data has to arrive through an adapter request or
`store.pushPayload`. A raw `store.push` skips serializers and leaves the strings untouched.

Both forms map arrays element by element, and turn unknown values into `undefined` rather than
failing the response.
