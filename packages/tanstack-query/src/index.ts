import { mapFields, type FieldMap } from '@real-enums/core'

/**
 * A `select` for useQuery/queryOptions that turns wire values into enum instances:
 * `select: enumSelect<Order>({ state: OrderState })`.
 *
 * Mapping happens on read, so the cache keeps the raw payload: persisters and `dehydrate`
 * see plain JSON. Enum instances are singletons, so structural sharing keeps the result
 * referentially stable across refetches. Define it outside the component (or with
 * useCallback) so TanStack does not re-run it on every render.
 */
export function enumSelect<T>(map: FieldMap): (data: unknown) => T {
  return data => mapFields<T>(data, map)
}
