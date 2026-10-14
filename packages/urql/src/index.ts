import type { Resolver } from '@urql/exchange-graphcache'
import type { Enum, EnumClass } from 'real-enums'

type Raw = string | null | undefined

/**
 * A Graphcache resolver for an enum-valued field, scalar or list:
 * `cacheExchange({ resolvers: { Order: { state: enumResolver(OrderState) } } })`.
 *
 * The cache keeps the raw value; only reads see instances.
 */
export function enumResolver<T extends Enum>(cls: EnumClass<T>): Resolver {
  const { parse } = cls.codec()
  // `undefined` from a resolver is a cache miss, which would refetch and null the whole
  // result; a stored null or an unknown value reads as null instead.
  const read = (raw: Raw) => parse(raw) ?? null
  return (parent, _args, _cache, info) => {
    const raw = parent[info.fieldName] as Raw | Raw[]
    if (raw === undefined) return undefined
    // Graphcache's resolver result type is its own data shape; enum instances are richer.
    return (Array.isArray(raw) ? raw.map(read) : read(raw)) as ReturnType<Resolver>
  }
}
