import type { Enum, EnumClass } from './index.js'

/**
 * The Standard Schema v1 interface, copied rather than depended on, as the spec recommends.
 * https://standardschema.dev
 */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
  readonly '~standard': {
    readonly version: 1
    readonly vendor: string
    readonly validate: (
      value: unknown,
    ) => StandardSchemaResult<Output> | Promise<StandardSchemaResult<Output>>
    readonly types?: { readonly input: Input; readonly output: Output } | undefined
  }
}

export type StandardSchemaResult<Output> =
  | { readonly value: Output; readonly issues?: undefined }
  | { readonly issues: ReadonlyArray<{ readonly message: string }> }

/**
 * A Standard Schema validator for an enum, for any library that accepts one (TanStack Form,
 * tRPC, react-hook-form's standard schema resolver, Hono, ...). Strict, unlike `codec()`:
 * anything that is not one of the enum's values is an issue.
 */
export function realEnum<T extends Enum>(cls: EnumClass<T>): StandardSchemaV1<string | T, T> {
  return {
    '~standard': {
      version: 1,
      vendor: 'real-enums',
      validate(value) {
        const found =
          typeof value === 'string'
            ? (cls.valueFor(value) as T | undefined)
            : cls.values.includes(value)
              ? (value as T)
              : undefined
        if (found) return { value: found }
        return { issues: [{ message: `Expected one of: ${cls.values.join(', ')}` }] }
      },
    },
  }
}
