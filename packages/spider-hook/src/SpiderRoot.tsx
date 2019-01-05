import * as React from 'react'
import { createStore, Dispatch, Slice, Reducer } from '@dwalter/spider-store'

export interface StoreContextContent {
  wrapReducer: <State>(reducer: Reducer<State>) => Slice<State>
  slices: Map<unknown, Slice>
}

export const StoreContext = React.createContext<StoreContextContent>({
  wrapReducer: () => {
    throw new Error(
      'StoreContext referenced from outside the context of a SpiderRoot',
    )
  },
  slices: new Map(),
})

export const DispatchContext = React.createContext<Dispatch>(() => {
  throw new Error(
    'DispatchContext referenced from outside the context of a SpiderRoot',
  )
})

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
      }}
    >
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StoreContext.Provider>
  )
}
