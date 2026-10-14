import type { EnumClass } from './index.js'

/**
 * Dotted paths to the enum class each field holds: `{ state: OrderState, 'items.status': ItemStatus }`.
 * Arrays are transparent, wherever they appear: at the root, along the path, or at the leaf.
 */
export type FieldMap = Record<string, EnumClass>

/**
 * Returns a copy of `data` with every mapped field turned into its enum instance. Missing paths
 * and nulls are left alone; unknown values become `undefined`, as with `valueFor`. Mapping data
 * that is already mapped is a no-op, so it is safe to run on every read.
 *
 * shortcut: the result type is whatever the caller names (`mapFields<Order>(...)`), not derived
 * from the map; upgrade to a path-level mapped type if callers start getting it wrong.
 */
export function mapFields<T = unknown>(data: unknown, map: FieldMap): T {
  let out = data
  for (const [path, cls] of Object.entries(map)) out = mapAt(out, path.split('.'), cls)
  return out as T
}

function mapAt(value: unknown, path: string[], cls: EnumClass): unknown {
  if (Array.isArray(value)) return value.map(item => mapAt(item, path, cls))
  if (path.length === 0) return value == null ? value : cls.valueFor(value as string)
  if (value == null || typeof value !== 'object') return value
  const [head, ...rest] = path as [string, ...string[]]
  if (!(head in value)) return value
  return { ...value, [head]: mapAt((value as Record<string, unknown>)[head], rest, cls) }
}
