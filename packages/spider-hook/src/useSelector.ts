import { useContext, useState, useEffect } from 'react'

import { Reducer, Slice, utils, Store, Shallow } from '@dwalter/spider-store'

import { StoreContext } from './SpiderRoot'
import { useIsFirstRender, noop, scheduleUpdate, constant } from './utils'

const { createSlice } = utils

export type Source<T> = Reducer<T, any> | Selector<T, any[]>

type SourceList = Source<any>[]

type InputList<Sources extends SourceList> = {
  [K in keyof Sources]: Sources[K] extends Source<infer T> ? T : never
}

type SliceList<Sources extends SourceList> = {
  [K in keyof Sources]: Sources[K] extends Source<infer T> ? Slice<T> : never
}

export interface Selector<T, Sources extends SourceList = SourceList> {
  sources: Sources
  mapping: (...args: SliceList<Sources>) => Slice<T>
  slices: Map<unknown, Slice<T>>
}

export const getSlice = (store: Store) =>
  function getSlice<T>(source: Source<T>): Slice<T> {
    if (typeof source === 'function') {
      if (store.slices.has(source)) {
        return store.slices.get(source)!
      } else {
        return store.wrapReducer(source)
      }
    } else {
      const { sources, mapping, slices } = source as Selector<T>
      if (slices.has(store)) {
        return slices.get(store)!
      } else {
        const parents = sources.map(getSlice)
        const slice = mapping.apply(null, parents)
        slices.set(store, slice)
        return slice
      }
    }
  }

export function createCustomSelector<Sources extends SourceList, Result>(
  sources: Sources,
  mapping: (...slices: SliceList<Sources>) => Slice<Result>,
): Selector<Result, Sources> {
  return { sources, mapping, slices: new Map() }
}

export function createSelector<Sources extends SourceList, Result>(
  sources: Sources,
  mapping: (...args: InputList<Sources>) => Result,
  shallow: Shallow<Result> = true,
): Selector<Result, Sources> {
  return createCustomSelector(sources, (...slices) => {
    return createSlice(slices, mapping as any, undefined, shallow)
  })
}

export function useSelector<T>(source: Source<T>): T {
  const store = useContext(StoreContext)
  const setup = useIsFirstRender()
  const slice = useState(setup ? getSlice(store)(source) : noop)[0]

  let subscription: number = -1
  const [value, setState] = useState(
    setup
      ? () => {
          subscription = slice.subscribe(v => {
            if (setState) {
              scheduleUpdate(setState as any, v)
            }
          })
          return slice.value
        }
      : noop,
  )

  useEffect(
    setup
      ? () => () => {
          slice.unsubscribe(subscription)
        }
      : noop,
    constant,
  )

  return value
}
