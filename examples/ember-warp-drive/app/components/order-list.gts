import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import type Owner from '@ember/owner';
import { OrderState } from 'example-ember-warp-drive/enums/order-state';
import { ORDERS } from 'example-ember-warp-drive/orders';
import type { Order } from 'example-ember-warp-drive/schemas/order';
import type Store from 'example-ember-warp-drive/services/store';

export default class OrderList extends Component {
  @service declare store: Store;
  @tracked filter = '';

  orders: Order[];

  constructor(owner: Owner, args: object) {
    super(owner, args);
    this.orders = this.store.push<Order>(ORDERS);
  }

  get shown() {
    const state = OrderState.valueFor(this.filter);
    return state ? this.orders.filter((order) => order.state === state) : this.orders;
  }

  setFilter = (event: Event) => {
    this.filter = (event.target as HTMLSelectElement).value;
  };

  // Stands in for the server confirming the change: it answers with the raw value, and the
  // record hydrates it back into an enum.
  advance = (order: Order) => {
    // Only rendered for states that have a next one.
    this.store.push<Order>({
      data: {
        type: 'order',
        id: order.id,
        attributes: { state: order.state.next!.value },
      },
    });
  };

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
  </template>
}
