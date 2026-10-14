import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, findAll, render } from '@ember/test-helpers';
import OrderList from 'example-ember-warp-drive/components/order-list';

const rows = () =>
  findAll('li').map((li) => li.textContent!.replace(/\s+/g, ' ').trim());

module('Integration | OrderList', function (hooks) {
  setupRenderingTest(hooks);

  test('each order reads its state as an enum', async function (assert) {
    await render(<template><OrderList /></template>);
    assert.deepEqual(rows(), [
      '#1001 Ada Lovelace Pending Ship',
      '#1002 Grace Hopper Shipped Deliver',
      '#1003 Katherine Johnson Delivered',
      '#1004 Alan Turing Cancelled',
    ]);
    assert.dom('li:last-child').hasClass('muted', '@is() works under Ember decorators');
    assert.dom('li:first-child .badge').hasClass('badge--pending');
  });

  test('@is() and @isNot() answer under Ember decorators', async function (assert) {
    const { OrderState } = await import('example-ember-warp-drive/enums/order-state');
    assert.deepEqual(
      (OrderState.values as InstanceType<typeof OrderState>[]).map((state) => [
        state.isPending,
        state.isCancelled,
        state.isNotCancelled,
      ]),
      [
        [true, false, true],
        [false, false, true],
        [false, false, true],
        [false, true, false],
      ],
    );
  });

  test('the filter is built from OrderState.values', async function (assert) {
    await render(<template><OrderList /></template>);
    assert.deepEqual(
      findAll('option').map((option) => option.textContent),
      ['All', 'Pending', 'Shipped', 'Delivered', 'Cancelled'],
    );
    await fillIn('select', 'delivered');
    assert.deepEqual(rows(), ['#1003 Katherine Johnson Delivered']);
  });

  test('a raw value pushed into the cache hydrates back into an enum', async function (assert) {
    await render(<template><OrderList /></template>);
    await click('li:first-child button');
    assert.deepEqual(rows().slice(0, 2), [
      '#1001 Ada Lovelace Shipped Deliver',
      '#1002 Grace Hopper Shipped Deliver',
    ]);
  });
});
