import * as React from 'react'

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
  children: any
  configureStore?: () => Store
}

export function SpiderRoot({
  children,
  configureStore = createStore,
}: SpiderRootProps) {
  const store = configureStore()
  registerStore(store)
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}
