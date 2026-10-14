## What and why

<!-- What changes, and the problem it solves. -->

## Website

- [ ] `docs/site/` updated for any change to packages, adapters, examples, or an API shown in
      a snippet — see **The website** in CONTRIBUTING.md.
- [ ] Nothing on the site is affected.

## Checks

- [ ] `pnpm lint && pnpm format:check && pnpm build && pnpm typecheck`
- [ ] `pnpm test` and, if an adapter or example changed, `pnpm test:examples`
- [ ] `npx changeset` added, if a published package changed
