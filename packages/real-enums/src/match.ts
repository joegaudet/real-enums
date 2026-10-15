import type { Enum } from './index.js'

/** Every static member of `C` that is a `T`, each as its own type. */
export type Members<C, T> = {
  [K in keyof C]: K extends 'prototype' ? never : C[K] extends T ? C[K] : never
}[keyof C]

/**
 * What `Cls.match(value)` returns. A static typed as the plain class (a member made with `new`,
 * or `static Default: Cls = ...`) would count as handling every member, so an enum with one
 * gets an error type instead.
 */
export type MatchOf<T, Left> = string extends (Left & Enum)['value']
  ? { error: 'every static of the class type must be a member declared with Cls.of(value)' }
  : Match<T, Left, never>

/** An exhaustive match in progress. `Left` is the members not yet handled. */
export interface Match<T, Left, R> {
  /** Handles these members. Only members not yet handled are accepted. */
  when<M extends Left, R2>(
    members: readonly M[],
    fn: (value: M) => R2,
  ): Match<T, Exclude<Left, M>, R | R2>
  /** The catch-all: runs when no `when` listed the value. */
  otherwise<R2>(fn: (value: T) => R2): R | R2
  /** Callable once every member is handled; until then its type names the ones left. */
  exhaustive: [Left] extends [never] ? () => R : { unhandled: Left }
}

// Untyped inside: the types above are what callers see.
export function matcher<T>(name: string, value: T): unknown {
  let hit: ((value: T) => unknown) | undefined
  const match = {
    when(members: readonly T[], fn: (value: T) => unknown) {
      if (!hit && members.includes(value)) hit = fn
      return match
    },
    otherwise: (fn: (value: T) => unknown) => (hit ?? fn)(value),
    exhaustive() {
      // Only reachable with a value the cases cannot list: one made with `new`, or a member of
      // a subclass, which type-checks as the parent's.
      if (!hit) throw new Error(`${name} has no case for "${String(value)}"`)
      return hit(value)
    },
  }
  return match
}
