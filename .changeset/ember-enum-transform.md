---
'@real-enums/warp-drive': minor
---

`@real-enums/warp-drive` is now a v2 Ember addon that adds one `enum` transform to the app:
`@attr<EnumTransform>('enum', { enum: OrderState })` on a Model needs no transform file. For
schema records, `enumTransformations({ 'order-state': OrderState })` registers every enum in
one line. `enumTransform` and `enumTransformation` still work.
