# Contributing

## Setup

```bash
pnpm install
pnpm build    # tsc writes the declarations, tsup the JS
```

Node ≥ 22.12 and pnpm. Packages resolve to each other through the workspace, but they import
each other's **built** output, so run `pnpm build` after changing `real-enums` before testing
an adapter or an example.

## The gate

```bash
pnpm lint
pnpm format:check
pnpm build
pnpm typecheck       # every package, then tests and tooling
pnpm test            # every package's unit tests, then the release-script tests
pnpm test:examples   # all six example apps; the Ember ones need Chrome
```

CI runs the same jobs (`.github/workflows/ci.yml`).

## How this is tested

Each adapter is tested against the real library it adapts, not a mock of it: a real
`QueryClient`, a real Redux store with RTK Query's middleware, a real `InMemoryCache`, a real
Graphcache. The tests pin down the behaviour the README promises (structural sharing keeps
references, the serializable check stays quiet, Apollo's cache holds raw strings), so a
library upgrade that changes it fails here first.

`@real-enums/warp-drive`'s unit tests stand in for `@embroider/macros`, which an Ember app's
build compiles away. The two Ember example apps are where it meets a real store, a real
Embroider/Vite build and Ember's legacy decorators.

`packages/real-enums/tests/readme.test.ts` runs the README's claims. If one changes, the README
changes with it. The `OrderState` class shown in the README and on the site is
`packages/real-enums/tests/fixtures/order-state.ts`, verbatim: `docs.test.ts` fails if either
copy drifts, so edit the fixture first and paste it into both.

## Examples

`examples/*` are standalone npm projects that StackBlitz opens from GitHub. Their
dependencies are the published ranges (`real-enums: ^2.0.0`); `pnpm-workspace.yaml`
overrides those to `workspace:*`, so inside the repo they run against local code. After a
major release, bump the ranges in every example.

The four React apps share `src/Orders.tsx`, `src/order-state.ts`, `src/api.ts`, `src/styles.css`
and `src/App.test.tsx`; only `App.tsx` (the data wiring) differs. Keep the shared files
identical. The two Ember apps share the `OrderState` enum and the component's markup the same
way.

## The website

[joegaudet.com/real-enums](https://joegaudet.com/real-enums/) is built from `docs/site/`: one
hand-written `index.html` and `site.css` on Pico.css, no build step.
`.github/workflows/pages.yml` deploys it on every push to `main` that touches `docs/site/`.

Nothing generates it from the code, so **a PR that changes anything the site shows updates the
site in the same PR**:

- **An adapter is added, removed or renamed:** the adapters grid, its tab in the "Wire it up"
  section, and the install list.
- **A public API used in a snippet changes** (`Enum`, `is`, `codec`, `mapFields`, `realEnum`, an
  adapter's function): every snippet that uses it. Search `docs/site/index.html` for the name.
- **An example app is added, removed or renamed:** its "Open in StackBlitz" link.

To preview:

```bash
python3 -m http.server 8766 --directory docs/site
```

## Releasing

Once per repository, before the first publish:

- Create the `real-enums` organization on npmjs.com, so the `@real-enums/*` scope exists.
- For every package, add this repository and `release.yml` as a trusted publisher in its
  npmjs.com settings. Publishing is OIDC; there is no `NPM_TOKEN`.
- Allow GitHub Actions to create pull requests (Settings → Actions → General).

After that, releases are automatic. Merging to `main` with changesets pending opens a "Version
Packages" PR; merging _that_ publishes, with provenance, through `scripts/publish.mjs`.

## Changesets

Every change that affects a published package needs one:

```bash
npx changeset
```

The packages version in lockstep (a fixed group), so pick the same bump for all of them.

## Style

Prettier and ESLint, both gated.
