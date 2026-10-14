import { isPlain } from '@reduxjs/toolkit'
import { Enum, mapFields, type FieldMap } from 'real-enums'

/**
 * A `transformResponse` that turns wire values into enum instances:
 * `transformResponse: enumResponse<Order>({ state: OrderState })`.
 */
export function enumResponse<T>(map: FieldMap): (response: unknown) => T {
  return response => mapFields<T>(response, map)
}

/**
 * Redux Toolkit's default serializable check, plus enum instances: pass it as
 * `getDefaultMiddleware({ serializableCheck: { isSerializable } })`. Enums serialize to their
 * raw value; anything that rehydrates the store (redux-persist, a DevTools import) gets that
 * string back, not the instance, so map again after rehydrating.
 */
export function isSerializable(value: unknown): boolean {
  return value instanceof Enum || isPlain(value)
}
