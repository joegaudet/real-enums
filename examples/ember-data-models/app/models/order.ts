import Model, { attr } from '@warp-drive/legacy/model'
import type { Type } from '@warp-drive/core/types/symbols'
import type { OrderState } from 'example-ember-data-models/enums/order-state'

export default class Order extends Model {
  @attr declare customer: string
  @attr('order-state') declare state: OrderState;

  declare [Type]: 'order'
}
