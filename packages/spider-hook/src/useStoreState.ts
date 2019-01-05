import { Reducer, Slice, utils } from '@dwalter/spider-store'
import { StoreContextContent, StoreContext } from './SpiderRoot'
import { useContext } from 'react'
import { useSlice } from './useSlice'

const { createSlice } = utils

export type Source<T> = Reducer<T> | Selector<T>

type SourceList = Source<any>[]

type InputList<Sources extends SourceList> = {
  [K in keyof Sources]: Sources[K] extends Source<infer T> ? T : never
}

interface Selector<T> {
  sources: SourceList
  mapping: (...args: any[]) => T
  shallow: boolean
}

export function createSelector<Sources extends SourceList, Result>(
  sources: Sources,
  mapping: (...args: InputList<Sources>) => Result,
  shallow: boolean = true,
) {
  return { sources, mapping, shallow }
}

function setSlice<T>(store: StoreContextContent, source: Source<T>): Slice<T> {
  if (typeof source === 'function') {
    const slice = store.wrapReducer(source)
    store.slices.set(source, slice)
    return slice
  } else {
    const slice = createSlice(
      source.sources.map(s => getSlice(store, s)),
      source.mapping,
      undefined,
      source.shallow,
    )
    store.slices.set(source, slice)
    return slice
  }
}

export function getSlice<T>(
  store: StoreContextContent,
  source: Source<T>,
): Slice<T> {
  if (store.slices.has(source)) {
    return store.slices.get(source)!
  } else {
    return setSlice(store, source)
  }
}

export function useStoreState<T>(source: Source<T>): T {
  const store = useContext(StoreContext)
  return useSlice(() => {
    const slice = getSlice(store, source)
    return slice
  })
}
