import { matcher, type MatchOf, type Members } from './match.js'

/**
 * Any subclass of {@link Enum}, as a value: `OrderState`, not `OrderState.Open`. Typed by its
 * prototype rather than its constructor, so a constructor with extra arguments, or a private
 * one, still fits.
 */
export type EnumClass<T extends Enum = Enum> = { prototype: T } & Pick<
  typeof Enum,
  'values' | 'valueFor' | 'codec'
>

/** Converts between an enum's raw wire value and its instance. */
export interface EnumCodec<T extends Enum> {
  /** Lenient: an unknown or missing value becomes `undefined` rather than throwing. */
  parse(raw: string | T | null | undefined): T | undefined
  serialize(value: T | string | null | undefined): string | null
}

// The values each class has declared with `of`.
const declared = new WeakMap<object, Set<string>>()

/**
 * A translatable string, per the msgid contract shared by Joe's libraries. Declared here
 * structurally so real-enums needs no i18n dependency.
 */
export interface Message {
  /** Stable key: `<i18n key>.<value>`, e.g. `orderState.pending`. */
  id: string
  /** English text, and the gettext msgid. */
  message: string
  /** English plural, and the gettext msgid_plural. Enum labels never set it. */
  plural?: string
  /** gettext msgctxt: the enum's key, so equal labels in different enums stay apart. */
  context?: string
  /** A note for translators. */
  description?: string
}

/** Translates a {@link Message}. Any msgid adapter, or your own object, fits. */
export interface Translator {
  /** BCP 47 locale. In Ember, make it tracked so a locale change re-renders. */
  readonly locale: string
  /** The translated string; falls back to English when it has none. */
  t(message: Message, values?: Record<string, unknown>): string
}

let translator: Translator | undefined

/** Sets the translator every keyed enum's `label` uses; `undefined` restores English. */
export function setTranslator(next: Translator | undefined): void {
  translator = next
}

function english(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

/**
 * The key that opts an enum into translated labels: `static i18n = 'orderState'` gives ids
 * `orderState.<value>`. Explicit because minifiers rename classes; read structurally so a
 * subclass needs no `override`.
 */
const keyOf = (cls: object) => (cls as { i18n?: string }).i18n

function messageOf(key: string, value: string): Message {
  return { id: `${key}.${value}`, message: english(value), context: key }
}

/**
 * Every member's label as a {@link Message}, in declaration order and in English, for a
 * catalog (msgid's CLI builds a .pot from them). Throws for an enum with no `static i18n`,
 * which would otherwise drop out of the catalog silently.
 */
export function messagesFor(cls: EnumClass): Message[] {
  const key = keyOf(cls)
  if (!key) throw new Error(`${(cls as { name?: string }).name} has no static i18n key`)
  return cls.values.map((member: Enum) => messageOf(key, member.value))
}

export class Enum extends String {
  readonly value: string

  constructor(value: string) {
    super(value)
    this.value = value
  }

  override valueOf(): string {
    return this.value
  }

  get id(): this {
    return this
  }

  /**
   * The value with its first letter capitalized, or, once the class has a `static i18n` key
   * and a translator is set, its translation. Read on every access (never cached), so a
   * tracked `locale` keeps it reactive in Ember.
   */
  get label(): string {
    const key = keyOf(this.constructor)
    return key && translator ? translator.t(messageOf(key, this.value)) : english(this.value)
  }

  /**
   * Every instance declared as a static member, in declaration order.
   *
   * A getter so templates can read it (`{{#each OrderState.values}}`). TypeScript cannot give
   * a static getter a per-subclass type, so it is `any[]`; annotate where it matters
   * (`const all: OrderState[] = OrderState.values`).
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static get values(): any[] {
    return Object.values(this).filter(member => member instanceof this)
  }

  /** The instance whose value is `raw`, or `undefined`. Passing an instance returns it. */
  static valueFor<T extends Enum>(this: EnumClass<T>, raw: string | T): T | undefined {
    const key = String(raw)
    return this.values.find((member: T) => member.value === key)
  }

  /**
   * Declares a member: `static Pending = OrderState.of('pending')`. Same instance as `new`, but
   * typed as its own member, which is what lets {@link Enum.match} track what is handled.
   */
  static of<T extends Enum, const V extends string, A extends unknown[]>(
    this: new (value: string, ...args: A) => T,
    value: V,
    ...args: A
  ): T & { readonly value: V } {
    // Two members with one value share a type, so `match` would count either as both.
    const seen = declared.get(this) ?? new Set<string>()
    if (seen.has(value)) throw new Error(`${this.name} already has a member "${value}"`)
    declared.set(this, seen.add(value))
    return new this(value, ...args) as T & { readonly value: V }
  }

  /**
   * Starts a match over the static members, checked by the compiler:
   * `.when([Cls.A, Cls.B], fn)` handles members, `.exhaustive()` compiles only once every
   * member is handled, and `.otherwise(fn)` is the catch-all.
   */
  static match<C, T extends Enum>(this: C & { prototype: T }, value: T): MatchOf<T, Members<C, T>> {
    return matcher((this as { name?: string }).name ?? 'Enum', value) as MatchOf<T, Members<C, T>>
  }

  static codec<T extends Enum>(this: EnumClass<T>): EnumCodec<T> {
    return {
      parse: raw => (raw == null ? undefined : this.valueFor(raw)),
      serialize: value => (value == null ? null : String(value)),
    }
  }
}

/**
 * A decorator that works under both decorator implementations in use: TC39 standard
 * decorators (`@is() accessor isOpen!: boolean`) and the legacy ones every Ember app compiles
 * with via decorator-transforms (`@is() declare isOpen: boolean`).
 */
export interface PredicateDecorator {
  <This extends Enum>(
    target: ClassAccessorDecoratorTarget<This, boolean>,
    context: ClassAccessorDecoratorContext<This, boolean>,
  ): ClassAccessorDecoratorResult<This, boolean>
  // Legacy: Babel defines the descriptor this returns, but TypeScript requires property
  // decorators to be typed as returning void.
  (prototype: Enum, key: string): void
}

function predicate(prefix: 'is' | 'isNot', matches: boolean): PredicateDecorator {
  return ((_target: unknown, contextOrKey: string | ClassAccessorDecoratorContext) => {
    const standard = typeof contextOrKey === 'object'
    const key = String(standard ? contextOrKey.name : contextOrKey).slice(prefix.length)
    function get(this: Enum) {
      const ctor = this.constructor as unknown as Record<string, unknown>
      // A typo would otherwise answer false forever, silently.
      if (!(key in ctor))
        throw new Error(`${(ctor as { name?: string }).name} has no static member "${key}"`)
      return (this === ctor[key]) === matches
    }
    return standard ? { get } : { configurable: true, enumerable: false, get }
  }) as PredicateDecorator
}

/**
 * True when the instance is the static member named after `is`: `@is() accessor isOpen!: boolean`
 * (standard decorators) or `@is() declare isOpen: boolean` (Ember's legacy decorators).
 */
export function is(): PredicateDecorator {
  return predicate('is', true)
}

/** The inverse of {@link is}: `@isNot() accessor isNotOpen!: boolean`. */
export function isNot(): PredicateDecorator {
  return predicate('isNot', false)
}

export type { Match, MatchOf, Members } from './match.js'
export { mapFields, type FieldMap } from './map-fields.js'
export { realEnum, type StandardSchemaResult, type StandardSchemaV1 } from './standard-schema.js'
