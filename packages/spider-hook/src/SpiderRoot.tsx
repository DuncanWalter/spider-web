import * as React from 'react'

import { createStore, Store } from '@dwalter/spider-store'

function contextError(): any {
  throw new Error(
    'StoreContext referenced from outside the context of a SpiderRoot',
  )
}

export const StoreContext = React.createContext<Store>({
  wrapReducer: contextError,
  dispatch: contextError,
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
  return (
    <StoreContext.Provider value={configureStore()}>
      {children}
    </StoreContext.Provider>
  )
}
