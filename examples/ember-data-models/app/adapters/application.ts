import { Adapter } from '@warp-drive/legacy/adapter'
import { ORDERS } from 'example-ember-data-models/orders'

// Stands in for a server. The serializer normalizes what it returns, and that is where the
// `order-state` transform runs, so data has to come through here (or `store.pushPayload`):
// a raw `store.push` skips serializers and leaves the strings as they are.
export default class ApplicationAdapter extends Adapter {
  findAll() {
    return Promise.resolve(structuredClone(ORDERS))
  }
}
