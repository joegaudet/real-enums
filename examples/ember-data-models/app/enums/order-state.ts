import { Enum, is, isNot } from '@real-enums/core'

export class OrderState extends Enum {
  static Pending = new OrderState('pending')
  static Shipped = new OrderState('shipped')
  static Delivered = new OrderState('delivered')
  static Cancelled = new OrderState('cancelled')

  // Ember compiles decorators (legacy semantics, via decorator-transforms), so `@is()` works
  // on a declared field. The name after `is` must match a static member.
  @is() declare isPending: boolean
  @is() declare isCancelled: boolean
  @isNot() declare isNotCancelled: boolean

  /** Where an order goes next, if anywhere. */
  get next(): OrderState | undefined {
    return {
      [OrderState.Pending.value]: OrderState.Shipped,
      [OrderState.Shipped.value]: OrderState.Delivered,
    }[this.value]
  }

  /** The button that moves an order on: the copy lives with the state, not in a template. */
  get advanceLabel(): string | undefined {
    return {
      [OrderState.Pending.value]: 'Ship',
      [OrderState.Shipped.value]: 'Deliver',
    }[this.value]
  }

  get className() {
    return `badge badge--${this.value}`
  }
}
