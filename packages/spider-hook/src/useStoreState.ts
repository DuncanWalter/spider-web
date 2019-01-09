import { useContext, useState } from 'react'

import { Reducer, Slice, utils } from '@dwalter/spider-store'

import { StoreContextContent, StoreContext } from './SpiderRoot'
import { useIsFirstRender, noop } from './utils'
import { useSlice } from './useSlice'

const { createSlice } = utils

interface Selector<Sources extends SourceList, T> {
  targets: number
  sources: Sources
  mapping: (...args: InputList<Sources>) => T
  shallow: boolean
}

export type Source<T> = Reducer<T, any> | Selector<any[], T>

type SourceList = Source<any>[]

type InputList<Sources extends SourceList> = {
  [K in keyof Sources]: Sources[K] extends Source<infer T> ? T : never
}

export function createSelector<Sources extends SourceList, Result>(
  sources: Sources,
  mapping: (...args: InputList<Sources>) => Result,
  shallow: boolean = true,
): Selector<Sources, Result> {
  return { sources, mapping, shallow, targets: 0 }
}

function setSlice<T>(store: StoreContextContent, source: Source<T>): Slice<T> {
  if (typeof source === 'function') {
    const slice = store.wrapReducer(source)
    store.slices.set(source, slice)
    return slice
  } else {
    const slice = createSlice(
      source.sources.map(s => {
        if (typeof s !== 'function') {
          s.targets += 1
        }
        return getSlice(store, s)
      }),
      source.mapping,
      undefined,
      source.shallow,
    )
    store.slices.set(source, slice)
    return slice
  }
}

export function deleteSlice(
  store: StoreContextContent,
  selector: Selector<SourceList, unknown>,
) {
  store.slices.delete(selector)
  for (let source of selector.sources) {
    if (typeof source !== 'function') {
      source.targets -= 1
      if (!source.targets) {
        deleteSlice(store, source)
      }
    }
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
  const setup = useIsFirstRender()
  const [slice] = useState(setup ? getSlice(store, source) : noop)

  return useSlice(store, source, slice)
}
