import type { Transformation } from '@warp-drive/core/reactive'
import { Type } from '@warp-drive/core/types/symbols'
import type { Enum, EnumClass } from '@real-enums/core'

import { codecFor, type Raw } from './codec.js'

export { EnumTransform, enumTransform, type EnumAttrOptions } from './legacy.js'

type Hydrated<T> = T | undefined

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
 * One WarpDrive Transformation for each enum in the map, for the store's `transformations`:
 * `enumTransformations({ 'order-state': OrderState })`, then `type: 'order-state'` on a field.
 *
 * Schema options must stay JSON, so a field cannot carry the class itself; the map names it.
 */
export function enumTransformations(enums: Record<string, EnumClass<Enum>>) {
  return Object.entries(enums).map(([name, cls]) => enumTransformation(cls, name))
}
