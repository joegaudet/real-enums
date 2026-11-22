# @real-enums/core

## 2.3.0

### Minor Changes

- adaa5f2: Translatable labels. An enum with `static i18n = 'orderState'` sends its `label` through the translator set with `setTranslator(translator)` (id `orderState.<value>`, the English label as msgid, the key as context); `messagesFor(Cls)` lists its messages for a catalog. Enums without a key, and apps that set no translator, are unchanged.

## 2.2.1

No changes in this release.

## 2.2.0

No changes in this release.

## 2.1.0

### Minor Changes

- 8191764: `Cls.of(value)` declares a member typed as itself, and `Cls.match(value)` branches on members
  with the compiler checking every member is handled: `.when([members], fn)`, then
  `.exhaustive()` or the `.otherwise(fn)` catch-all.

## 2.0.0

### Major Changes

- 4911fff: The core package is now published as `@real-enums/core`; install it in place of `real-enums` and change imports to match.

  real-enums 2.0: `valueFor` and `codec()` typed to the subclass, `@is()`/`@isNot()` under both standard and Ember's
  legacy decorators, `codec()`, `mapFields`, a Standard Schema validator, compiled ESM/CJS
  builds, and adapters for WarpDrive/ember-data, TanStack Query, SWR, RTK Query, Apollo Client
  and urql.
