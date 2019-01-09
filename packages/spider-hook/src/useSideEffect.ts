import { useContext, useEffect } from 'react'

import { Dispatch } from '@dwalter/spider-store'

import { StoreContext, DispatchContext } from './SpiderRoot'
import { Source, getSlice } from './useStoreState'
import { useIsFirstRender, noop, constant } from './utils'

interface SideEffect<T = any> {
  source: Source<T>
  effect: (input: T, dispatch: Dispatch) => unknown
  subscription: null | number
  semaphore: number
}

export function createSideEffect<T>(
  source: Source<T>,
  effect: (input: T, dispatch: Dispatch) => unknown,
): SideEffect<T> {
  return { source, effect, semaphore: 0, subscription: null }
}

export function useSideEffect<T>(sideEffect: SideEffect<T>) {
  const store = useContext(StoreContext)
  const setup = useIsFirstRender()
  const dispatch = useContext(DispatchContext)
  useEffect(
    setup
      ? () => {
          if (sideEffect.semaphore === 0) {
            const slice = getSlice(store, sideEffect.source)
            sideEffect.subscription = slice.subscribe(value =>
              sideEffect.effect(value, dispatch),
            )
          }
          sideEffect.semaphore += 1
          return () => {
            sideEffect.semaphore -= 1
            if (sideEffect.semaphore === 0) {
              const slice = getSlice(store, sideEffect.source)
              slice.unsubscribe(sideEffect.subscription!)
              sideEffect.subscription = null
            }
          }
        }
      : noop,
    constant,
  )
}
