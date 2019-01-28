import { useContext, useEffect } from 'react'

import { Dispatch, Slice } from '@dwalter/spider-store'

import { StoreContext } from './SpiderRoot'
import { Source } from './useSelector'
import { useIsFirstRender, noop, constant } from './utils'
import { getSlice } from './getSlice'

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

/**
 * Creates a `SideEffect` which runs a callback whenever the value
 * of a `Selector` (or `Reducer`) changes. The callback is also passed
 * `dispatch()`. `SideEffects` can be
 * consumed in components via the hook `useSideEffect()`. There is currently
 * no way to consume a `SideEffect` outside of a component.
 * @param selector the `Selector` or `Reducer`to watch for changes
 * @param effect a callback which is run whenever the selector's
 * value updates.
 */
export function createSideEffect<T>(
  selector: Source<T>,
  effect: (input: T, dispatch: Dispatch) => unknown,
): SideEffect<T> {
  return { source: selector, effect, locks: new Map() }
}

/**
 * Activates a `SideEffect` so it will begin watching
 * updates. `useSideEffect()` ensures that the same `SideEffect`
 * is never running multiple times at once and that `SideEffect`s
 * which are not currently in use are deactivated for performance.
 * @param sideEffect the `SideEffect` to activate for the lifetime
 * of the component calling `useSideEffect()`
 */
export function useSideEffect<T>(sideEffect: SideEffect<T>) {
  const store = useContext(StoreContext)
  const setup = useIsFirstRender()
  useEffect(
    setup
      ? () => {
          if (!sideEffect.locks.has(store)) {
            const slice = getSlice(store.dispatch, sideEffect.source)
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
