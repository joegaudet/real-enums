import type { Enum, EnumClass } from '@real-enums/core'

export type Raw = string | null | undefined

/** Parses and serializes one value or an array of them. */
export function codecFor<T extends Enum>(cls: EnumClass<T>) {
  const { parse, serialize } = cls.codec()
  return {
    parse: (raw: Raw | Raw[]) => (Array.isArray(raw) ? raw.map(parse) : parse(raw)),
    serialize: (value: T | null | undefined | T[]) =>
      Array.isArray(value) ? value.map(serialize) : serialize(value),
  }
}
