import { Store, Reducer, Slice, Dispatch } from '@dwalter/spider-store'
import { Selector, Source } from './useSelector'

const sliceRetrievers = new WeakMap()

export function registerStore({ dispatch, slices, wrapReducer }: Store) {
  if (sliceRetrievers.has(dispatch)) return

  function getReducerSlice<T>(reducer: Reducer<T>): Slice<T> {
    if (slices.has(reducer)) {
      return slices.get(reducer)!
    } else {
      return wrapReducer(reducer)
    }
  }

  function getSelectorSlice<T>(selector: Selector<T>): Slice<T> {
    const { sources, mapping, slices } = selector
    if (slices.has(dispatch)) {
      return slices.get(dispatch)!
    } else {
      const parents = sources.map(getSourceSlice)
      const slice = mapping.apply(null, parents)
      slices.set(dispatch, slice)
      return slice
    }
  }

  function getSourceSlice<T>(source: Source<T>): Slice<T> {
    if (typeof source === 'function') {
      return getReducerSlice(source)
    } else {
      return getSelectorSlice(source)
    }
  }

  sliceRetrievers.set(dispatch, getSourceSlice)
}

export function getSlice<T>(dispatch: Dispatch, source: Source<T>): Slice<T> {
  return sliceRetrievers.get(dispatch)(source)
}
