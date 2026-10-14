import { enumTransform } from '@real-enums/warp-drive'
import { OrderState } from 'example-ember-data-models/enums/order-state'

// Makes `@attr('order-state')` available on every model.
export default enumTransform(OrderState)
