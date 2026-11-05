'use strict'

// Lets a classic ember-cli build load this v2 addon. Embroider reads `ember-addon` directly.
const { addonV1Shim } = require('@embroider/addon-shim')

module.exports = addonV1Shim(__dirname)
