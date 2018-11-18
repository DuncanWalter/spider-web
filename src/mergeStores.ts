import { Store, sliceKey } from './createStore'

export function mergeStores(...stores: Store<any>[]) {
  const allSlices = new Set()
  for (let slices of stores.map(store => store[sliceKey])) {
    for (let slice of slices) {
      allSlices.add(slice)
    }
  }
  const sliceList = [...allSlices]
  for (let store of stores) {
    store['@store/slices'] = sliceList
  }
}
