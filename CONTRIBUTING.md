# Contributing

## Setup

```bash
pnpm install
pnpm build    # tsc writes the declarations, tsup the JS
```

Node ≥ 22.12 and pnpm. Packages resolve to each other through the workspace, but they import
each other's **built** output, so run `pnpm build` after changing `@real-enums/core` before testing
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
- **The headline or the adapter list changes:** the link-preview card too. Edit
  `docs/social-card.html` and re-render `docs/site/social-card.png` with the command in its
  header comment; `docs.test.ts` checks the meta tags and the image size.

To preview:

```bash
python3 -m http.server 8766 --directory docs/site
```

## Releasing

A release is cut by pushing a tag. Nothing publishes on merge.

1. PRs that change a published package carry a changeset (`pnpm changeset`). While any are
   pending on `main`, CI keeps a "chore: version packages" PR open with the next version and
   the changelogs.
2. Merge that PR.
3. Tag the merge commit with the new version and push the tag:

   ```bash
   git switch main && git pull
   git tag -a v1.2.3 -m v1.2.3
   git push origin v1.2.3
   ```

`release.yml` checks that the tag is on `main` and matches every public package's version,
publishes whatever is not already on npm through `scripts/publish.mjs` (OIDC trusted publishing
with provenance; there is no `NPM_TOKEN`), then creates the GitHub release. If a run fails, re-run
it: it skips what is already published.

**A brand-new package** cannot publish through OIDC: npm only configures a trusted publisher for
a name that already exists. Its first release goes out once through `bootstrap-publish.yml` with
a short-lived token (restore that file from git history if it has been deleted; its header has
the steps). After that, set `joegaudet/real-enums` / `release.yml` as the package's trusted
publisher on npmjs.com.

Actions must be allowed to create pull requests (Settings → Actions → General), or the version
PR cannot open.

## Changesets

Every change that affects a published package needs one:

```bash
npx changeset
```

The packages version in lockstep (a fixed group), so pick the same bump for all of them.

## Style

Prettier and ESLint, both gated.
