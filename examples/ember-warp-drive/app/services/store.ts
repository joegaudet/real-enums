import { useRecommendedStore } from '@warp-drive/core'
import { JSONAPICache } from '@warp-drive/json-api'
import { enumTransformations } from '@real-enums/warp-drive'
import { OrderState } from 'example-ember-warp-drive/enums/order-state'
import { OrderSchema } from 'example-ember-warp-drive/schemas/order'

const Store = useRecommendedStore({
  cache: JSONAPICache,
  schemas: [OrderSchema],
  // One entry for each enum; a field names it with `type`. Schemas stay JSON, so they name
  // the enum rather than hold the class.
  transformations: enumTransformations({ 'order-state': OrderState }),
})

type Store = InstanceType<typeof Store>

export default Store
