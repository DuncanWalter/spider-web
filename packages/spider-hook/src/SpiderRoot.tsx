import React, { ReactChild, useRef } from 'react'

import { createStore, Store as InnerStore, Slice } from '@dwalter/spider-store'
import { Source, Selector, Store } from './types'
import { useIsFirstRender, noop } from './utils'

function contextError(): any {
  throw new Error(
    'StoreContext referenced from outside the context of a SpiderRoot',
  )
}

export const StoreContext = React.createContext<Store>({
  wrapReducer: contextError,
  dispatch: contextError,
  resolve: contextError,
  getSlice: contextError,
})

export interface SpiderRootProps {
  children: ReactChild
  configureStore?: () => InnerStore
}

/**
 * `SpiderRoot` provides state store access to its children via the
 * context API. Any app made using `spider-hook` will need to render
 * `SpiderRoot` as ancestor to all components using a state store.
 * A one-to-one mapping between instances of `SpiderRoot` in the React
 * component tree and state stores. `SpiderRoot` will never cause a
 * rerender of itself, but it is still safe to rerender an instance of
 * `SpiderRoot`.
 *
 * `SpiderRoot` accepts a single optional prop: `configureStore`.
 * `configureStore` is a function which takes no parameters and
 * returns a `Store`.
 */
export function SpiderRoot({
  children,
  configureStore = createStore,
}: SpiderRootProps) {
  const setup = useIsFirstRender()

  const { current: store } = useRef(
    setup ? createStoreContextContent(configureStore) : noop,
  )

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

function createStoreContextContent(configureStore: () => InnerStore) {
  const store = configureStore()
  return {
    ...store,
    getSlice: createGetSlice(store),
  }
}

function createGetSlice({ wrapReducer }: InnerStore) {
  const selectorSlices = new WeakMap<Selector<any>, Slice>()

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
      return wrapReducer(source)
    } else {
      return getSelectorSlice(source)
    }
  }

  return getSourceSlice
}
