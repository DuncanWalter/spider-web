import { useContext, useEffect } from 'react'

import { Dispatch, Slice } from '@dwalter/spider-store'

import { StoreContext } from './SpiderRoot'
import { Source, getSlice } from './useSelector'
import { useIsFirstRender, noop, constant } from './utils'

interface SideEffect<T = any> {
  source: Source<T>
  effect: (input: T, dispatch: Dispatch) => unknown
  locks: Map<
    unknown,
    {
      subscription: number
      semaphore: number
      slice: Slice<any>
    }
  >
}

export function createSideEffect<T>(
  source: Source<T>,
  effect: (input: T, dispatch: Dispatch) => unknown,
): SideEffect<T> {
  return { source, effect, locks: new Map() }
}

export function useSideEffect<T>(sideEffect: SideEffect<T>) {
  const store = useContext(StoreContext)
  const setup = useIsFirstRender()
  useEffect(
    setup
      ? () => {
          if (!sideEffect.locks.has(store)) {
            const slice = getSlice(store)(sideEffect.source)
            const lock = {
              subscription: slice.subscribe(value =>
                sideEffect.effect(value, store.dispatch),
              ),
              semaphore: 1,
              slice,
            }
            sideEffect.locks.set(store, lock)
          } else {
            sideEffect.locks.get(store)!.semaphore += 1
          }
          return () => {
            const lock = sideEffect.locks.get(store)!
            lock.semaphore -= 1
            if (lock.semaphore === 0) {
              lock.slice.unsubscribe(lock.subscription)
              sideEffect.locks.delete(store)
            }
          }
        }
      : noop,
    constant,
  )
}
