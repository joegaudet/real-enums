import { useRecommendedStore } from '@warp-drive/core'
import { JSONAPICache } from '@warp-drive/json-api'
import { enumTransformation } from '@real-enums/warp-drive'
import { OrderState } from 'example-ember-warp-drive/enums/order-state'
import { OrderSchema } from 'example-ember-warp-drive/schemas/order'

const Store = useRecommendedStore({
  cache: JSONAPICache,
  schemas: [OrderSchema],
  transformations: [enumTransformation(OrderState, 'order-state')],
})

type Store = InstanceType<typeof Store>

export default Store
