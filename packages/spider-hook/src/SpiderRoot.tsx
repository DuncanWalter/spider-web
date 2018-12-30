import * as React from 'react'
import { createStore } from '@dwalter/spider-store'
import { DispatchContext } from './useAction'
import { StoreContext } from './wrapReducers'

export function SpiderRoot({ children }: { children: any }) {
  const { dispatch, wrapReducer } = createStore()
  return (
    <StoreContext.Provider
      value={{
        wrapReducer,
        storeFragments: new Map(),
      }}
    >
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StoreContext.Provider>
  )
}
