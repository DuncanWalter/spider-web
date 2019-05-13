import { useContext, useEffect } from 'react'

import { StoreContext } from './SpiderRoot'
import { SideEffect } from './types'
import { useShouldUpdate, noop, semaphore } from './utils'

/**
 * Activates a `SideEffect` so it will begin watching
 * updates. `useSideEffect()` ensures that the same `SideEffect`
 * is never running multiple times at once and that `SideEffect`s
 * which are not currently in use are deactivated for performance.
 * @param sideEffect the `SideEffect` to activate for the lifetime
 * of the component calling `useSideEffect()`
 */
export function useSideEffect<T>(sideEffect: SideEffect<T>) {
  const deps = [sideEffect]

  const shouldUpdate = useShouldUpdate(deps)

  const { dispatch, resolve, getSlice } = useContext(StoreContext)

  useEffect(
    shouldUpdate
      ? () => {
          if (!sideEffect.locks.has(dispatch)) {
            const slice = getSlice<T>(sideEffect.source)
            sideEffect.locks.set(
              dispatch,
              semaphore(() => {
                const subscription = slice.subscribe(value =>
                  sideEffect.effect(value, dispatch, resolve),
                )
                return () => slice.unsubscribe(subscription)
              }),
            )
          }
          return sideEffect.locks.get(dispatch)!()
        }
      : noop,
    deps,
  )
}
