import { mapFields, type FieldMap } from '@real-enums/core'

/**
 * Wraps an SWR fetcher so its data arrives as enum instances, typed:
 * `useSWR('/orders/1', withEnums<Order>(fetchJson, { state: OrderState }))`.
 *
 * Enum instances are singletons, so SWR's comparison sees a revalidation with the same payload
 * as unchanged and keeps the same object.
 */
export function withEnums<T, Args extends unknown[] = [string]>(
  fetcher: (...args: Args) => unknown,
  map: FieldMap,
): (...args: Args) => Promise<T> {
  return async (...args) => mapFields<T>(await fetcher(...args), map)
}
