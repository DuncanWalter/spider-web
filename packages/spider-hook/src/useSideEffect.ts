import { useContext, useEffect } from 'react'
import { StoreContext } from './SpiderRoot'
import { Source, getSlice } from './useStoreState'

interface SideEffect<T = any> {
  source: Source<T>
  effect: (input: T) => unknown
  subscription: null | number
  semaphore: number
}

export function createSideEffect<T>(
  source: Source<T>,
  effect: (input: T) => unknown,
): SideEffect<T> {
  return { source, effect, semaphore: 0, subscription: null }
}

export function useSideEffect<T>(sideEffect: SideEffect<T>) {
  const store = useContext(StoreContext)
  // TODO: could make this function present on store objects for perf?
  useEffect(() => {
    if (sideEffect.semaphore === 0) {
      const slice = getSlice(store, sideEffect.source)
      sideEffect.subscription = slice.subscribe(sideEffect.effect)
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
  }, [])
}
