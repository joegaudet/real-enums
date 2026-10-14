import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { OrderState } from 'example-ember-data-models/enums/order-state';
import type Order from 'example-ember-data-models/models/order';

export default class OrderList extends Component<{ Args: { orders: Order[] } }> {
  @tracked filter = '';

  get orders() {
    return this.args.orders;
  }

  get shown() {
    const state = OrderState.valueFor(this.filter);
    return state ? this.orders.filter((order) => order.state === state) : this.orders;
  }

  setFilter = (event: Event) => {
    this.filter = (event.target as HTMLSelectElement).value;
  };

  // A local edit: the model holds the enum, and serialize() runs the transform to produce
  // exactly what save() would send.
  advance = (order: Order) => {
    order.state = order.state.next!;
  };

  // serialize() reads through a snapshot, which Glimmer cannot track, so the state is passed in
  // to re-run this when it changes.
  json = (order: Order, _state: OrderState) => JSON.stringify(order.serialize());

  <template>
    <h1>Orders</h1>
    <label>
      State
      <select {{on "change" this.setFilter}}>
        <option value="">All</option>
        {{#each OrderState.values as |state|}}
          <option value={{state.value}}>{{state.label}}</option>
        {{/each}}
      </select>
    </label>
    <ul>
      {{#each this.shown as |order|}}
        <li class={{if order.state.isCancelled "muted"}}>
          <span>#{{order.id}} {{order.customer}}</span>
          <span class={{order.state.className}}>{{order.state.label}}</span>
          {{#if order.state.advanceLabel}}
            <button type="button" {{on "click" (fn this.advance order)}}>
              {{order.state.advanceLabel}}
            </button>
          {{/if}}
        </li>
      {{/each}}
    </ul>
    <details>
      <summary>As save() would send it</summary>
      {{#each this.orders as |order|}}
        <pre data-test-json={{order.id}}>{{this.json order order.state}}</pre>
      {{/each}}
    </details>
  </template>
}
