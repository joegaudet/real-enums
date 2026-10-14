import type { CollectionResourceDocument } from '@warp-drive/core/types/spec/json-api-raw'

// What a JSON:API server would send. The cache keeps these strings; records read enums.
export const ORDERS: CollectionResourceDocument<'order'> = {
  data: [
    { type: 'order', id: '1001', attributes: { customer: 'Ada Lovelace', state: 'pending' } },
    { type: 'order', id: '1002', attributes: { customer: 'Grace Hopper', state: 'shipped' } },
    {
      type: 'order',
      id: '1003',
      attributes: { customer: 'Katherine Johnson', state: 'delivered' },
    },
    { type: 'order', id: '1004', attributes: { customer: 'Alan Turing', state: 'cancelled' } },
  ],
}
