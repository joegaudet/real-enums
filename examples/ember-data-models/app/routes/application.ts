import Route from '@ember/routing/route'
import { service } from '@ember/service'
import type Store from 'example-ember-data-models/services/store'

export default class ApplicationRoute extends Route {
  @service declare store: Store

  model() {
    return this.store.findAll('order')
  }
}
