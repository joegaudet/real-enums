---
'@real-enums/core': minor
---

Translatable labels. An enum with `static i18n = 'orderState'` sends its `label` through the translator set with `setTranslator(translator)` (id `orderState.<value>`, the English label as msgid, the key as context); `messagesFor(Cls)` lists its messages for a catalog. Enums without a key, and apps that set no translator, are unchanged.
