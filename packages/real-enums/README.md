# real-enums

Enums that are real classes. A label, an icon, a CSS class, or "what comes next" lives on
the value instead of in an `if`/`else` ladder in every template that shows it.

```ts
import { Enum, is, isNot } from 'real-enums'

export class OrderState extends Enum {
  static Pending = new OrderState('pending')
  static Shipped = new OrderState('shipped')
  static Delivered = new OrderState('delivered')
  static Cancelled = new OrderState('cancelled')

  @is() accessor isPending!: boolean
  @is() accessor isCancelled!: boolean
  @isNot() accessor isNotCancelled!: boolean

  get next(): OrderState | undefined {
    return {
      [OrderState.Pending.value]: OrderState.Shipped,
      [OrderState.Shipped.value]: OrderState.Delivered,
    }[this.value]
  }

  get advanceLabel(): string | undefined {
    return {
      [OrderState.Pending.value]: 'Ship',
      [OrderState.Shipped.value]: 'Deliver',
    }[this.value]
  }

  get className() {
    return `badge badge--${this.value}`
  }
}
```

Instead of this, repeated wherever an order's state is shown:

```handlebars
{{#if (eq order.state 'pending')}}Pending{{else if (eq order.state 'shipped')}}Shipped{{/if}}
```

the template asks the value:

```handlebars
<span class={{order.state.className}}>{{order.state.label}}</span>
```

and a dropdown is built from the enum itself:

```handlebars
{{#each OrderState.values as |state|}}
  <option value={{state.value}}>{{state.label}}</option>
{{/each}}
```

Site and live examples: **https://joegaudet.com/real-enums/**

## Install

```bash
npm install real-enums
```

Then add the adapter for your data layer, if there is one:

| Data layer             | Package                       |
| ---------------------- | ----------------------------- |
| WarpDrive / ember-data | `@real-enums/warp-drive`      |
| TanStack Query         | `@real-enums/tanstack-query`  |
| SWR                    | `@real-enums/swr`             |
| RTK Query              | `@real-enums/rtk-query`       |
| Apollo Client          | `@real-enums/apollo`          |
| urql (Graphcache)      | `@real-enums/urql`            |
| Anything else          | `mapFields` / `codec()` below |

## API

### `class Enum`

Extend it and declare each value as a static member. Instances are singletons, so `===`
works, and they extend `String`, so they compare loosely with the raw value (`==`),
interpolate as it, and `JSON.stringify` writes it.

| Member              | What it does                                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `value`             | The raw string.                                                                                                        |
| `label`             | The value with its first letter capitalized: `'on_hold'` → `'On_hold'`. Override it.                                   |
| `id`                | The instance itself, for `<option value={{state.id}}>` in templates. In JSX, where props want a `string`, use `value`. |
| `Cls.values`        | Every static instance, in declaration order.                                                                           |
| `Cls.valueFor(raw)` | The instance for a raw value, or `undefined`. Passing an instance returns it.                                          |
| `Cls.codec()`       | `{ parse, serialize }` for adapters (below).                                                                           |

`values` is a getter so templates can read it, and TypeScript cannot give a static getter a
per-subclass type, so it is `any[]`. Annotate where it matters:
`const all: OrderState[] = OrderState.values`.

### `@is()` / `@isNot()`

Boolean predicates named after the static members. The name after `is`/`isNot` must match
a static member; a typo throws on first read instead of always answering `false`.

```ts
// Standard (TC39) decorators: TypeScript 5+, Babel's 2023-11 plugin, esbuild.
class OrderState extends Enum {
  static Pending = new OrderState('pending')
  @is() accessor isPending!: boolean
}

// Legacy decorators: what every Ember app compiles with (decorator-transforms).
class OrderState extends Enum {
  static Pending = new OrderState('pending')
  @is() declare isPending: boolean
}
```

Both forms work with the same import. Vite 8 does not lower decorators on its own; in a
plain Vite app either add a decorator transform or write the getter by hand:
`get isPending() { return this === OrderState.Pending }`.

### `codec()`

```ts
const { parse, serialize } = OrderState.codec()
parse('pending') // OrderState.Pending
parse('archived') // undefined: unknown values never throw
parse(null) // undefined
serialize(OrderState.Pending) // 'pending'
serialize('pending') // 'pending': raw values pass through
serialize(undefined) // null
```

Parsing is lenient on purpose: when a server adds a state before the client knows about it,
one field reads `undefined` instead of the whole response failing. Use `realEnum()` when you
want strictness.

### `mapFields(data, map)`

Returns a copy of `data` with each mapped path turned into enum instances. Paths are dotted,
and arrays are transparent wherever they appear: at the root, along the path, or at the leaf.

```ts
mapFields<Order[]>(json, { state: OrderState, 'lines.status': LineStatus, tags: Tag })
```

Missing paths and nulls are left alone; it never mutates its input, and mapping data that is
already mapped is a no-op. The result type is the one you name.

### `realEnum(Cls)`

A [Standard Schema](https://standardschema.dev) validator, for anything that takes one
(TanStack Form, tRPC, react-hook-form's standard schema resolver, Hono, ...). Strict: anything
other than one of the enum's values, or an instance, is an issue.

```ts
realEnum(OrderState)['~standard'].validate('pending') // { value: OrderState.Pending }
realEnum(OrderState)['~standard'].validate('nope') // { issues: [{ message: 'Expected one of: pending, shipped, delivered' }] }
```

## Upgrading from 1.x

- `valueFor` and `codec()` are typed to the subclass, and `valueFor` takes an instance too.
  (`values` stays `any[]`: see above.)
- `@is()`/`@isNot()` work under Ember's legacy decorators again, and throw on a name with no
  matching static member.
- `label` no longer depends on `inflection`; it capitalizes the first letter and lower-cases
  the rest, which is what `inflection.capitalize` did.
- New: `codec()`, `mapFields`, `realEnum`, and the adapter packages.
- The packages ship compiled ESM with declarations, instead of a `.ts` entry point. ESM only:
  Vite, Embroider and Node 22's `require(esm)` all load it.

## License

MIT
