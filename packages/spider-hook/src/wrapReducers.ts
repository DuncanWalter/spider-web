import { createContext, useContext } from 'react'
import { Slice } from '@dwalter/spider-store'

// TODO: needs to track reducers individually?

interface Action {
  type: string
  reducer?: Reducer<unknown>
}

interface Reducer<State> {
  (state: State | undefined, action: Action): State
}

export interface UseStore<Slices extends { [key: string]: Slice<unknown> }> {
  (): Slices
}

interface StoreContextContent {
  wrapReducer: <State>(reducer: Reducer<State>) => Slice<State>
  storeFragments: Map<unknown, { [key: string]: Slice<unknown> }>
}

type ReducerMap = { [key: string]: Reducer<unknown> }

type SliceMap<Reducers extends ReducerMap> = {
  [K in keyof Reducers]: Reducers[K] extends Reducer<infer State>
    ? Slice<State>
    : never
}

export const StoreContext = createContext<StoreContextContent>({
  wrapReducer: () => {
    throw new Error(
      'StoreContext referenced from outside the context of a SpiderRoot',
    )
  },
  storeFragments: new Map(),
})

export function wrapReducers<
  Reducers extends {
    [key: string]: Reducer<any>
  }
>(reducers: Reducers): UseStore<SliceMap<Reducers>> {
  return function useStore() {
    const { wrapReducer, storeFragments } = useContext(StoreContext)
    if (storeFragments.has(useStore)) {
      return storeFragments.get(useStore) as SliceMap<Reducers>
    } else {
      const slices = Object.keys(reducers).reduce(
        (acc, key) => {
          acc[key] = wrapReducer(reducers[key]) as Slice<any>
          return acc
        },
        {} as { [key: string]: Slice<unknown> },
      )
      storeFragments.set(useStore, slices)
      return slices as SliceMap<Reducers>
    }
  }
}
