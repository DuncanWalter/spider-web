import { useContext, useEffect } from 'react'

import { Dispatch } from '@dwalter/spider-store'

import { StoreContext } from './SpiderRoot'
import { Source } from './useSelector'
import { useIsFirstRender, noop, constant } from './utils'
import { getSlice } from './getSlice'

export interface SideEffect<T = any> {
  source: Source<T>
  effect: (input: T, dispatch: Dispatch) => unknown
  locks: WeakMap<Dispatch, () => () => void>
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
  return { source: selector, effect, locks: new WeakMap() }
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
  const { dispatch } = useContext(StoreContext)
  const setup = useIsFirstRender()
  useEffect(
    setup
      ? () => {
          if (!sideEffect.locks.has(dispatch)) {
            const slice = getSlice(dispatch, sideEffect.source)
            sideEffect.locks.set(
              dispatch,
              semaphore(() => {
                const subscription = slice.subscribe(value => {
                  sideEffect.effect(value, dispatch)
                })
                return () => slice.unsubscribe(subscription)
              }),
            )
          }
          return sideEffect.locks.get(dispatch)!()
        }
      : noop,
    constant,
  )
}

function semaphore(fun: () => () => void): () => () => void {
  let semaphore = 0
  let callback: () => void = noop
  return () => {
    if (!semaphore++) {
      callback = fun()
    }
    return () => {
      if (--semaphore) {
        callback()
        callback = noop
      }
    }
  }
}
