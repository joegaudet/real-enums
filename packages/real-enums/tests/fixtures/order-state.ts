import { Enum, is, isNot } from '../../src/index.js'

// The OrderState shown in the README and on the site. docs.test.ts checks both still show
// exactly this, and readme.test.ts runs it.
export class OrderState extends Enum {
  static Pending = OrderState.of('pending')
  static Shipped = OrderState.of('shipped')
  static Delivered = OrderState.of('delivered')
  static Cancelled = OrderState.of('cancelled')

  @is() accessor isPending!: boolean
  @is() accessor isCancelled!: boolean
  @isNot() accessor isNotCancelled!: boolean

  get next(): OrderState | undefined {
    return {
      [OrderState.Pending.value]: OrderState.Shipped,
      [OrderState.Shipped.value]: OrderState.Delivered,
    }[this.value]
  }

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
