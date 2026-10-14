import { useLegacyStore } from '@warp-drive/legacy'
import { JSONAPICache } from '@warp-drive/json-api'

// Models, serializers and transforms are looked up from app/ by the resolver, as in any
// ember-data app.
const Store = useLegacyStore({
  linksMode: false,
  legacyRequests: true,
  cache: JSONAPICache,
})

type Store = InstanceType<typeof Store>

export default Store
