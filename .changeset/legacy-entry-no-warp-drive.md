---
'@real-enums/warp-drive': patch
---

The `enum` transform an Ember app gets now loads from a new `@real-enums/warp-drive/legacy` entry
that imports nothing from WarpDrive at runtime. Before, it loaded `@warp-drive/core`, and in an app
on ember-data 5.8 that also had `@warp-drive/core` 5.9 installed, WarpDrive threw "Multiple
versions of WarpDrive detected" at boot.
