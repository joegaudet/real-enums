# @real-enums/warp-drive

[real-enums](https://joegaudet.com/real-enums/) for WarpDrive and ember-data: one `enum`
transform for `@attr` on legacy Models, and Transformations for schema records.

```bash
npm install @real-enums/core @real-enums/warp-drive
```

Works with `@warp-drive/core` 5.8 and later (ember-data 5.8+). It is a v2 Ember addon, so an
Embroider/Vite or classic Ember app picks it up with no setup. The runtime code imports nothing
from Ember.

## Legacy Models

Give the attribute the `enum` transform and the enum class. There is no transform file to
write: the package adds `transform:enum` to the app.

```ts
// app/models/order.ts
import Model, { attr } from '@warp-drive/legacy/model'
import type { EnumTransform } from '@real-enums/warp-drive'
import { OrderState } from 'my-app/enums/order-state'

export default class Order extends Model {
  @attr<EnumTransform>('enum', { enum: OrderState }) declare state: OrderState
}
```

The `<EnumTransform>` type argument lets TypeScript check the options: leaving out `enum` is a
type error. Without TypeScript, a missing `enum` throws the first time the attribute is read or
saved.

Legacy transforms run in the serializer, so data has to arrive through an adapter request or
`store.pushPayload`. A raw `store.push` skips serializers and leaves the strings untouched.

## Schema records

Register the enums once, by name, then use the name as a field's `type`. The cache keeps the
raw string; the record reads the enum.

```ts
// app/services/store.ts
import { useRecommendedStore } from '@warp-drive/core'
import { JSONAPICache } from '@warp-drive/json-api'
import { enumTransformations } from '@real-enums/warp-drive'

export default useRecommendedStore({
  cache: JSONAPICache,
  schemas: [OrderSchema],
  transformations: enumTransformations({ 'order-state': OrderState }),
})

// app/schemas/order.ts
export const OrderSchema = withDefaults({
  type: 'order',
  fields: [{ kind: 'field', name: 'state', type: 'order-state' }],
})
```

Schemas are JSON, so a field cannot hold the class; the map gives each enum its name. The
name is not derived from the class, because minifiers rename classes. The map also imports
every enum, so a template that reads `record.state.label` without importing the enum still
works.

`enumTransformation(OrderState, 'order-state')` makes one Transformation, and
`enumTransform(OrderState)` makes a transform for one enum, for apps that registered them
that way before.

Both forms map arrays element by element, and turn unknown values into `undefined` rather than
failing the response.
