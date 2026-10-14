import type { Transformation } from '@warp-drive/core/reactive'
import { Type } from '@warp-drive/core/types/symbols'
import type { Enum, EnumClass } from 'real-enums'

type Raw = string | null | undefined
type Hydrated<T> = T | undefined

function codecFor<T extends Enum>(cls: EnumClass<T>) {
  const { parse, serialize } = cls.codec()
  return {
    parse: (raw: Raw | Raw[]) => (Array.isArray(raw) ? raw.map(parse) : parse(raw)),
    serialize: (value: T | null | undefined | T[]) =>
      Array.isArray(value) ? value.map(serialize) : serialize(value),
  }
}

/**
 * A WarpDrive Transformation for schema fields: register it with
 * `store.schema.registerTransformation(enumTransformation(OrderState, 'order-state'))` and use
 * `{ kind: 'field', name: 'state', type: 'order-state' }`.
 *
 * The name is required rather than derived from the class: minifiers rename classes.
 */
export function enumTransformation<T extends Enum>(
  cls: EnumClass<T>,
  name: string,
): Transformation<string | null | string[], Hydrated<T> | Hydrated<T>[]> {
  const codec = codecFor(cls)
  return {
    [Type]: name,
    hydrate: raw => codec.parse(raw as Raw | Raw[]),
    serialize: value => codec.serialize(value as T | T[] | undefined) as string | null | string[],
  }
}

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
