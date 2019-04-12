import React, { useState, ReactChild } from 'react'

import { createStore, Store } from '@dwalter/spider-store'
import { registerStore } from './getSlice'

function contextError(): any {
  throw new Error(
    'StoreContext referenced from outside the context of a SpiderRoot',
  )
}

export const StoreContext = React.createContext<Store>({
  wrapReducer: contextError,
  dispatch: contextError,
  resolve: contextError,
  slices: new Map(),
})

export interface SpiderRootProps {
  children: ReactChild
  configureStore?: () => Store
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
  const [store] = useState(configureStore())
  registerStore(store)
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}
