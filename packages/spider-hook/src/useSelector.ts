import { useContext, useState, useEffect } from 'react'

import { Reducer, Slice, utils } from '@dwalter/spider-store'

import { StoreContext } from './SpiderRoot'
import { useIsFirstRender, noop, scheduleUpdate, constant } from './utils'

export type Source<T> = Reducer<T, any> | Selector<any[], T>

const { createSlice } = utils

type SourceList = Source<any>[]

type InputList<Sources extends SourceList> = {
  [K in keyof Sources]: Sources[K] extends Source<infer T> ? T : never
}

type SliceList<Sources extends SourceList> = {
  [K in keyof Sources]: Sources[K] extends Source<infer T> ? Slice<T> : never
}

export interface Selector<Sources extends SourceList, T> {
  // TODO: won't work because it's shared between stores...
  sources: Sources
  mapping: (...args: SliceList<Sources>) => Slice<T>
}

export function createCustomSelector<Sources extends SourceList, Result>(
  sources: Sources,
  mapping: (...slices: SliceList<Sources>) => Slice<Result>,
): Selector<Sources, Result> {
  return { sources, mapping }
}

export function createSelector<Sources extends SourceList, Result>(
  sources: Sources,
  mapping: (...args: InputList<Sources>) => Result,
  shallow: boolean = true,
): Selector<Sources, Result> {
  return createCustomSelector(sources, (...slices) => {
    return createSlice(slices, mapping as any, undefined, shallow)
  })
}

export function useSelector<T>(source: Source<T>): T {
  const store = useContext(StoreContext)
  const setup = useIsFirstRender()
  const slice = useState(setup ? store.checkoutSlice(source) : noop)[0]

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
          store.returnSlice(source)
        }
      : noop,
    constant,
  )

  return value
}
