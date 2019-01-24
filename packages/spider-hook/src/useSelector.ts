import { useContext, useState, useEffect } from 'react'

import { Reducer, Slice, utils, Store, Shallow } from '@dwalter/spider-store'

import { StoreContext } from './SpiderRoot'
import { useIsFirstRender, noop, scheduleUpdate, constant } from './utils'

const { createSlice } = utils

export interface Selector<T, Slices extends Slice<any>[] = Slice<any>[]> {
  sources: Source<any>[]
  mapping: (...slices: Slices) => Slice<T>
  slices: Map<unknown, Slice<T>>
}

export type Source<T> = Reducer<T> | Selector<T>

type InputSources<Inputs extends any[]> = {
  [K in keyof Inputs]: Source<Inputs[K]>
}

type SliceInputs<Slices extends Slice<any>[]> = {
  [K in keyof Slices]: Slices[K] extends Slice<infer T> ? T : never
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

export function createCustomSelector<Slices extends Slice<any>[], Result>(
  sources: InputSources<SliceInputs<Slices>>,
  mapping: (...slices: Slices) => Slice<Result>,
): Selector<Result, Slices> {
  return { sources, mapping, slices: new Map() }
}

export function createSelector<Inputs extends any[], Result>(
  sources: InputSources<Inputs>,
  mapping: (...args: Inputs) => Result,
  shallow: Shallow<Result> = true,
): Selector<Result> {
  return createCustomSelector(sources as any, (...slices) => {
    return createSlice(slices, mapping as any, undefined, shallow)
  })
}

/**
 * A React hook which reads state from a `Selector` or `Reducer` and
 * rerenders the component when state updates. Automatically handles
 * wrapping `Reducer`s, subscription logic, and retrieving the
 * correct store using the context api.
 * @param selector The `Selector` or `Reducer` to read state from.
 */
export function useSelector<T>(selector: Source<T>): T {
  const setup = useIsFirstRender()
  const store = useContext(StoreContext)
  const slice = useState(setup ? getSlice(store)(selector) : noop)[0]

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
