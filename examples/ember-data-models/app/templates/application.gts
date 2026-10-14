import type { TOC } from '@ember/component/template-only';
import OrderList from 'example-ember-data-models/components/order-list';
import type Order from 'example-ember-data-models/models/order';

<template>
  <main>
    <OrderList @orders={{@model}} />
  </main>
</template> satisfies TOC<{ Args: { model: Order[] } }>;
