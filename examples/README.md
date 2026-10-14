# Examples

The same orders screen in six apps: a state badge and button copy read off the enum, a filter
built from `OrderState.values`, and an edit that goes back over the wire as the raw string.
Only the data wiring differs between them.

| App                                            | Data layer                  | Tests            |
| ---------------------------------------------- | --------------------------- | ---------------- |
| [`ember-warp-drive`](ember-warp-drive)         | WarpDrive schema records    | QUnit, in Chrome |
| [`ember-data-models`](ember-data-models)       | ember-data Models + `@attr` | QUnit, in Chrome |
| [`react-tanstack-query`](react-tanstack-query) | TanStack Query              | Vitest + jsdom   |
| [`react-swr`](react-swr)                       | SWR                         | Vitest + jsdom   |
| [`react-rtk-query`](react-rtk-query)           | RTK Query                   | Vitest + jsdom   |
| [`react-apollo`](react-apollo)                 | Apollo Client               | Vitest + jsdom   |

Each one is a standalone npm project: open it on StackBlitz from the site, or run it locally.

```bash
cd examples/react-tanstack-query && npm install && npm run dev
```

They depend on the published packages (`^2.0.0`). Inside this repo's pnpm workspace those
ranges are overridden to the local packages, so CI tests them against unreleased code.
