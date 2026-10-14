import { withDefaults } from '@warp-drive/core/reactive'
import type { Type } from '@warp-drive/core/types/symbols'
import type { OrderState } from 'example-ember-warp-drive/enums/order-state'

export const OrderSchema = withDefaults({
  type: 'order',
  fields: [
    { kind: 'field', name: 'customer' },
    // `order-state` is the name the transformation is registered under in services/store.ts.
    { kind: 'field', name: 'state', type: 'order-state' },
  ],
})

export interface Order {
  id: string
  customer: string
  state: OrderState
  [Type]: 'order'
}
