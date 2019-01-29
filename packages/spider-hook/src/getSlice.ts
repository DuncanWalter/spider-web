import { Store, Reducer, Slice, Dispatch } from '@dwalter/spider-store'
import { Selector, Source } from './useSelector'
import { SideEffect } from './useSideEffect'

const sliceRetrievers = new WeakMap()

export function registerStore({ dispatch, slices, wrapReducer }: Store) {
  if (sliceRetrievers.has(dispatch)) return

  const selectorSlices = new WeakMap<Selector<any>, Slice>()

  function getReducerSlice<T>(reducer: Reducer<T>): Slice<T> {
    if (slices.has(reducer)) {
      return slices.get(reducer)!
    } else {
      return wrapReducer(reducer)
    }
  }

  function getSelectorSlice<T>(selector: Selector<T>): Slice<T> {
    const { sources, mapping } = selector
    if (selectorSlices.has(selector)) {
      return selectorSlices.get(selector)!
    } else {
      const parents = sources.map(getSourceSlice)
      const slice = mapping.apply(null, parents)
      selectorSlices.set(selector, slice)
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

export function getSlice<T>(
  dispatch: Dispatch,
  source: Source<T> | SideEffect<T>,
): Slice<T> {
  return sliceRetrievers.get(dispatch)(source)
}
