# real-enums

Enums that are real classes: a label, an icon, a CSS class or "what comes next" lives on the
value, not in an `if`/`else` ladder in every template that shows it. With adapters that turn
the strings your API sends into enum instances, for Ember (WarpDrive and ember-data) and for
React's data libraries.

**Site, docs and live examples: https://joegaudet.com/real-enums/**

| Package                                                 | For                                                                                 |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [`@real-enums/core`](packages/real-enums)               | The `Enum` class, `@is()`, exhaustive `match`, codecs, `mapFields`, Standard Schema |
| [`@real-enums/warp-drive`](packages/warp-drive)         | WarpDrive schema records and ember-data Models                                      |
| [`@real-enums/tanstack-query`](packages/tanstack-query) | TanStack Query `select`                                                             |
| [`@real-enums/swr`](packages/swr)                       | SWR fetchers                                                                        |
| [`@real-enums/rtk-query`](packages/rtk-query)           | RTK Query `transformResponse` and the serializable check                            |
| [`@real-enums/apollo`](packages/apollo)                 | Apollo Client field policies                                                        |
| [`@real-enums/urql`](packages/urql)                     | urql Graphcache resolvers                                                           |

Runnable apps, one per data layer, are in [`examples/`](examples).

Contributing: [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
