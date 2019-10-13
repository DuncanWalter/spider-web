import React, { ReactChild, useRef } from 'react'

import {
  createStore,
  Store as InnerStore,
  Slice,
  WrapReducer,
  utils,
  Dispatchable,
} from '@dwalter/spider-store'

import { useShouldUpdate, noop } from './utils'

import { Selector, Store, BindableAction, CreateStore } from './types'

function contextError(): any {
  throw new Error(
    'StoreContext referenced from outside the context of a SpiderRoot',
  )
}

export const StoreContext = React.createContext<Store>({
  wrapReducer: contextError,
  dispatch: contextError,
  peek: contextError,
  getSlice: contextError,
})

export interface ProviderProps {
  children: ReactChild
  configureStore?: (storeFactory: CreateStore) => InnerStore
}

function weakCacheMemo<K extends object, V>(get: (key: K) => V) {
  // using a weak cache to prevent memory leaks when using
  // dynamically created selectors. Also preserves refs between
  // renders, which keeps things quick. Looks a bit odd.
  const cache = new WeakMap<K, V>()

  return (key: K) => {
    if (cache.has(key)) {
      return cache.get(key)!
    } else {
      const value = get(key)
      cache.set(key, value)
      return value
    }
  }
}
function createGetSlice(wrapReducer: WrapReducer) {
  function getSelectorSlice<T>(selector: Selector<T>): Slice<T> {
    if (utils.isSlice<T>(selector)) {
      return selector
    }
    if (utils.isFunction(selector)) {
      return wrapReducer(selector)
    }
    const { sources, mapping } = selector

    // eslint-disable-next-line prefer-spread
    return mapping.apply(null, sources.map(getSelectorSlice))
  }

  return weakCacheMemo(getSelectorSlice) as typeof getSelectorSlice
}

function createStoreContextContent(
  configureStore: (storeFactory: CreateStore) => InnerStore,
): Store {
  const { wrapReducer, dispatch, peek } = configureStore(createStore)

  const getSlice = createGetSlice(wrapReducer)

  function hookPeek<T>(selector: Selector<T>) {
    if (utils.isSlice<T>(selector)) {
      return peek(selector)
    } else {
      return peek(getSlice(selector))
    }
  }

  function hookDispatch(action: BindableAction | Dispatchable) {
    if (utils.isFunction(action)) {
      return action(hookDispatch, hookPeek)
    } else {
      dispatch(action)
    }
  }

  return {
    wrapReducer,
    peek: hookPeek,
    dispatch: hookDispatch,
    getSlice,
  }
}

export function Provider({
  children,
  configureStore = () => createStore(),
}: ProviderProps) {
  const shouldUpdate = useShouldUpdate()

  const { current: store } = useRef<Store>(
    shouldUpdate ? createStoreContextContent(configureStore) : noop,
  )

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}
