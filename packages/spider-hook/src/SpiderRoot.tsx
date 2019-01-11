import * as React from 'react'

import {
  createStore,
  Dispatch,
  Slice,
  Reducer,
  Store,
} from '@dwalter/spider-store'

import { Source } from './useSelector'

export class StoreContextContent {
  slices: Map<unknown, Slice<any>>
  sliceUsage: Map<unknown, number>
  wrapReducer: Store['wrapReducer']

  constructor(wrapReducer: Store['wrapReducer']) {
    this.slices = new Map()
    this.sliceUsage = new Map()
    this.wrapReducer = wrapReducer
  }

  setSlice<T>(source: Source<T>): Slice<T> {
    if (typeof source === 'function') {
      const slice = this.wrapReducer(source)
      this.slices.set(source, slice)
      this.sliceUsage.set(source, Infinity)
      return slice
    } else {
      const slice = source.mapping.apply(
        null,
        source.sources.map(s => this.checkoutSlice(s)),
      )
      this.slices.set(source, slice)
      this.sliceUsage.set(source, 1)
      return slice
    }
  }

  returnSlice(source: Source<any>) {
    const usage = this.sliceUsage.get(source)
    if (usage === 1 || !usage) {
      this.slices.delete(source)
      this.sliceUsage.delete(source)
      if (typeof source !== 'function') {
        for (let s of source.sources) {
          this.returnSlice(s)
        }
      }
    } else {
      this.sliceUsage.set(source, usage - 1)
    }
  }

  checkoutSlice<T>(source: Source<T>): Slice<T> {
    if (this.slices.has(source)) {
      return this.slices.get(source)!
    } else {
      return this.setSlice(source)
    }
  }
}

export const StoreContext = React.createContext(
  new StoreContextContent(() => {
    throw new Error(
      'StoreContext referenced from outside the context of a SpiderRoot',
    )
  }),
)

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
    <StoreContext.Provider value={new StoreContextContent(wrapReducer)}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StoreContext.Provider>
  )
}
