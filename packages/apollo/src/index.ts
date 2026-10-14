import type { FieldPolicy } from '@apollo/client'
import type { Enum, EnumClass } from 'real-enums'

type Raw = string | null | undefined

/**
 * A field policy for an enum-valued field, scalar or list:
 * `typePolicies: { Order: { fields: { state: enumField(OrderState) } } }`.
 *
 * Reads return instances; writes store the raw value, so the normalized cache (and anything
 * that persists it) stays plain JSON.
 */
export function enumField<T extends Enum>(
  cls: EnumClass<T>,
): FieldPolicy<Raw | Raw[], Raw | Raw[], T | null | undefined | (T | null)[]> {
  const { parse, serialize } = cls.codec()
  // `undefined` from a read function tells Apollo the field is missing, which would refetch
  // and drop the result; a stored null or an unknown value reads as null instead.
  const read = (raw: Raw) => parse(raw) ?? null
  return {
    read: existing =>
      existing === undefined
        ? undefined
        : Array.isArray(existing)
          ? existing.map(read)
          : read(existing as Raw),
    merge: (_, incoming) =>
      Array.isArray(incoming) ? incoming.map(serialize) : serialize(incoming as Raw),
  }
}
