import { module, test } from 'qunit'
import { setupApplicationTest } from 'ember-qunit'
import { visit } from '@ember/test-helpers'

module('Acceptance | orders', function (hooks) {
  setupApplicationTest(hooks)

  test('the app boots and lists every order with its state', async function (assert) {
    await visit('/')
    assert.dom('li').exists({ count: 4 })
    assert.dom('li:first-child .badge').hasText('Pending')
  })
})
