// The legacy ember-data transforms. This entry must not load WarpDrive at runtime (only types):
// the enum transform an Ember app gets imports it, and an app on ember-data 5.8 can have a second
// @warp-drive/core installed, which WarpDrive refuses to run beside the first.
import type { TransformName } from '@warp-drive/core/types/symbols'
import type { Enum, EnumClass } from '@real-enums/core'

import { codecFor, type Raw } from './codec.js'

/**
 * A legacy ember-data transform for `@attr('order-state')` on a Model:
 * `export default enumTransform(OrderState)` from `app/transforms/order-state.ts`.
 */
export function enumTransform<T extends Enum>(cls: EnumClass<T>) {
  const codec = codecFor(cls)
  return class EnumTransform {
    deserialize(serialized: Raw | Raw[]) {
      return codec.parse(serialized)
    }

    serialize(deserialized: T | null | undefined | T[]) {
      return codec.serialize(deserialized)
    }

    static create() {
      return new this()
    }
  }
}

/** The options `@attr('enum', …)` declares; ember-data passes them to the transform. */
export type EnumAttrOptions = { enum: EnumClass<Enum> }

function codecFromOptions(options: Partial<EnumAttrOptions> | null | undefined) {
  const cls = options?.enum
  if (!cls) {
    throw new Error(
      "@attr('enum') needs the enum class in its options: @attr('enum', { enum: SomeEnum })",
    )
  }
  return codecFor(cls)
}

/**
 * The one legacy ember-data transform every enum shares: `@attr('enum', { enum: OrderState })`.
 * ember-data passes the attribute's options to the transform, so no app needs a transform file
 * for each enum. Ember apps get it as `transform:enum` from this package's `app-js`.
 */
export class EnumTransform {
  /** Lets `@attr<EnumTransform>('enum', { enum: OrderState })` check its options. */
  declare [TransformName]: 'enum'

  // The array overloads come first: ember-data's typed `@attr<EnumTransform>` reads the last
  // signature, which has to be a single value for it to accept the options.
  deserialize(serialized: Raw[], options: EnumAttrOptions): (Enum | undefined)[]
  deserialize(serialized: Raw, options: EnumAttrOptions): Enum | undefined
  deserialize(serialized: Raw | Raw[], options: EnumAttrOptions) {
    return codecFromOptions(options).parse(serialized)
  }

  serialize(deserialized: (Enum | string)[], options: EnumAttrOptions): (string | null)[]
  serialize(deserialized: Enum | string | null | undefined, options: EnumAttrOptions): string | null
  serialize(
    deserialized: Enum | string | null | undefined | (Enum | string)[],
    options: EnumAttrOptions,
  ) {
    return codecFromOptions(options).serialize(deserialized as Enum)
  }

  static create() {
    return new this()
  }
}
