---
'@real-enums/core': minor
---

`Cls.of(value)` declares a member typed as itself, and `Cls.match(value)` branches on members
with the compiler checking every member is handled: `.when([members], fn)`, then
`.exhaustive()` or the `.otherwise(fn)` catch-all.
