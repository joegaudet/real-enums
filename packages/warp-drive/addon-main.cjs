'use strict'

// Lets a classic ember-cli build load this v2 addon. Embroider reads `ember-addon` directly.
const { addonShim } = require('@warp-drive/core/addon-shim.cjs')

module.exports = addonShim(__dirname)
