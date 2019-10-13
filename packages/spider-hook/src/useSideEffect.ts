import { useContext, useEffect } from 'react'

import { StoreContext } from './Provider'
import { SideEffect } from './types'
import { useShouldUpdate, noop, semaphore } from './utils'

export function useSideEffect<T>(sideEffect: SideEffect<T>) {
  const deps = [sideEffect]

  const shouldUpdate = useShouldUpdate(deps)

  const { dispatch, peek, getSlice } = useContext(StoreContext)

  useEffect(
    shouldUpdate
      ? () => {
          if (!sideEffect.locks.has(dispatch)) {
            const slice = getSlice<T>(sideEffect.source)
            sideEffect.locks.set(
              dispatch,
              semaphore(() => {
                const subscription = slice.subscribe(value =>
                  sideEffect.effect(value, dispatch, peek),
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
