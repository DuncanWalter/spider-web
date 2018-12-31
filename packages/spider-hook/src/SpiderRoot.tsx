import * as React from 'react'
import { createStore, Dispatch, Slice, Reducer } from '@dwalter/spider-store'
import { DispatchContext } from './wrapAction'
import { StoreContext } from './wrapReducers'

export interface SpiderRootProps {
  children: any
  configureStore?: () => {
    dispatch: Dispatch
    wrapReducer: <State>(reducer: Reducer<State>) => Slice<State>
  }
}

export function SpiderRoot({
  children,
  configureStore = createStore,
}: SpiderRootProps) {
  const { dispatch, wrapReducer } = configureStore()
  return (
    <StoreContext.Provider
      value={{
        wrapReducer,
        slices: new Map(),
        storeFragments: new Map(),
      }}
    >
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StoreContext.Provider>
  )
}
