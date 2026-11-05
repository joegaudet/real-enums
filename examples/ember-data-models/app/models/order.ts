import Model, { attr } from '@warp-drive/legacy/model'
import type { Type } from '@warp-drive/core/types/symbols'
import { OrderState } from 'example-ember-data-models/enums/order-state'
import type { EnumTransform } from '@real-enums/warp-drive'

export default class Order extends Model {
  @attr declare customer: string
  // `enum` is the one transform @real-enums/warp-drive adds to every Ember app.
  @attr<EnumTransform>('enum', { enum: OrderState }) declare state: OrderState;

  declare [Type]: 'order'
}
