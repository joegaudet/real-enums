import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, findAll, render } from '@ember/test-helpers';
import OrderList from 'example-ember-data-models/components/order-list';
import type Order from 'example-ember-data-models/models/order';
import type Store from 'example-ember-data-models/services/store';

const rows = () =>
  findAll('li').map((li) => li.textContent!.replace(/\s+/g, ' ').trim());

module('Integration | OrderList', function (hooks) {
  setupRenderingTest(hooks);

  let orders: Order[];
  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store') as Store;
    orders = (await store.findAll('order')).slice() as Order[];
  });

  test('each order reads its state as an enum', async function (assert) {
    await render(<template><OrderList @orders={{orders}} /></template>);
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
    const { OrderState } = await import('example-ember-data-models/enums/order-state');
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
    await render(<template><OrderList @orders={{orders}} /></template>);
    assert.deepEqual(
      findAll('option').map((option) => option.textContent),
      ['All', 'Pending', 'Shipped', 'Delivered', 'Cancelled'],
    );
    await fillIn('select', 'delivered');
    assert.deepEqual(rows(), ['#1003 Katherine Johnson Delivered']);
  });

  test('setting an enum serializes it back to its raw value', async function (assert) {
    await render(<template><OrderList @orders={{orders}} /></template>);
    await click('li:first-child button');
    assert.deepEqual(rows().slice(0, 2), [
      '#1001 Ada Lovelace Shipped Deliver',
      '#1002 Grace Hopper Shipped Deliver',
    ]);
    const sent = orders[0]!.serialize() as { data: { attributes: { state: unknown } } };
    assert.strictEqual(sent.data.attributes.state, 'shipped');
    assert.dom('[data-test-json="1001"]').includesText('"state":"shipped"');
  });
});
