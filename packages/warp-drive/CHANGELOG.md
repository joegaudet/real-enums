# @real-enums/warp-drive

## 2.2.1

### Patch Changes

- 35e911f: The `enum` transform an Ember app gets now loads from a new `@real-enums/warp-drive/legacy` entry
  that imports nothing from WarpDrive at runtime. Before, it loaded `@warp-drive/core`, and in an app
  on ember-data 5.8 that also had `@warp-drive/core` 5.9 installed, WarpDrive threw "Multiple
  versions of WarpDrive detected" at boot.
- @real-enums/core@2.2.1

## 2.2.0

### Minor Changes

- 27dae62: `@real-enums/warp-drive` is now a v2 Ember addon that adds one `enum` transform to the app:
  `@attr<EnumTransform>('enum', { enum: OrderState })` on a Model needs no transform file. For
  schema records, `enumTransformations({ 'order-state': OrderState })` registers every enum in
  one line. `enumTransform` and `enumTransformation` still work.

### Patch Changes

- @real-enums/core@2.2.0

## 2.1.0

### Patch Changes

- Updated dependencies [8191764]
  - @real-enums/core@2.1.0

## 2.0.0

### Major Changes

- 4911fff: The core package is now published as `@real-enums/core`; install it in place of `real-enums` and change imports to match.

  real-enums 2.0: `valueFor` and `codec()` typed to the subclass, `@is()`/`@isNot()` under both standard and Ember's
  legacy decorators, `codec()`, `mapFields`, a Standard Schema validator, compiled ESM/CJS
  builds, and adapters for WarpDrive/ember-data, TanStack Query, SWR, RTK Query, Apollo Client
  and urql.

### Patch Changes

- Updated dependencies [4911fff]
  - @real-enums/core@2.0.0
