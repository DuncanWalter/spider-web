import { useContext, useState, useEffect } from 'react'

import {
  Reducer,
  Slice,
  utils,
  Shallow,
  Subscription,
} from '@dwalter/spider-store'

import { StoreContext } from './SpiderRoot'
import { useIsFirstRender, noop, constant } from './utils'
import { getSlice } from './getSlice'

const { createSlice } = utils

type SourceList = Source<any>[]

export interface Selector<T> {
  sources: Source<any>[]
  mapping: (...slices: any) => Slice<T>
}

export type Source<T = any> = Reducer<T, any> | Selector<T>

type SourceSlices<Sources extends SourceList> = {
  [K in keyof Sources]: Sources[K] extends Source<infer T> ? Slice<T> : never
}

type SourceInputs<Sources extends SourceList> = {
  [K in keyof Sources]: Sources[K] extends Source<infer T> ? T : never
}

export function createCustomSelector<Sources extends SourceList, Result>(
  sources: Sources,
  mapping: (...slices: SourceSlices<Sources>) => Slice<Result>,
): Selector<Result> {
  return { sources, mapping }
}

export function createSelector<Sources extends SourceList, Result>(
  sources: Sources,
  mapping: (...args: SourceInputs<Sources>) => Result,
  shallow: Shallow<Result> = true,
): Selector<Result> {
  return createCustomSelector(sources, (...slices) => {
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
  const slice = useState(setup ? getSlice(store.dispatch, selector) : noop)[0]

  let subscription: Subscription
  const [value, setState] = useState(
    setup
      ? () => {
          subscription = slice.subscribe(v => {
            if (setState) {
              setState(v)
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
