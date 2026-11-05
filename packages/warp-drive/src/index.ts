import type { Transformation } from '@warp-drive/core/reactive'
import { Type } from '@warp-drive/core/types/symbols'
import type { TransformName } from '@warp-drive/core/types/symbols'
import type { Enum, EnumClass } from '@real-enums/core'

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

/**
 * One WarpDrive Transformation for each enum in the map, for the store's `transformations`:
 * `enumTransformations({ 'order-state': OrderState })`, then `type: 'order-state'` on a field.
 *
 * Schema options must stay JSON, so a field cannot carry the class itself; the map names it.
 */
export function enumTransformations(enums: Record<string, EnumClass<Enum>>) {
  return Object.entries(enums).map(([name, cls]) => enumTransformation(cls, name))
}
