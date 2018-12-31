import { createContext, useContext } from 'react'
import { Slice, Reducer } from '@dwalter/spider-store'

interface StoreContextContent {
  wrapReducer: <State>(reducer: Reducer<State>) => Slice<State>
  slices: Map<unknown, Slice>
  storeFragments: Map<unknown, unknown>
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
  slices: new Map(),
  storeFragments: new Map(),
})

export function wrapReducers<
  Reducers extends {
    [key: string]: Reducer<any>
  }
>(reducers: Reducers): () => SliceMap<Reducers>

export function wrapReducers<
  Reducers extends {
    [key: string]: Reducer<any>
  },
  Result
>(
  reducers: Reducers,
  configure: (slices: SliceMap<Reducers>) => Result,
): () => Result

export function wrapReducers<
  Reducers extends {
    [key: string]: Reducer<any>
  },
  Result
>(
  reducers: Reducers,
  configure: (slices: SliceMap<Reducers>) => Result = i => i as any,
): () => Result {
  return function useStore() {
    const { wrapReducer, slices, storeFragments } = useContext(StoreContext)
    if (storeFragments.has(useStore)) {
      return storeFragments.get(useStore) as Result
    } else {
      const result = configure(Object.keys(reducers).reduce(
        (acc, key) => {
          const reducer = reducers[key]
          if (slices.has(reducer)) {
            acc[key] = slices.get(reducers[key])!
          } else {
            acc[key] = wrapReducer(reducers[key])
            slices.set(reducer, acc[key])
          }
          return acc
        },
        {} as { [key: string]: Slice<unknown> },
      ) as SliceMap<Reducers>)
      storeFragments.set(useStore, result)
      return result
    }
  }
}
