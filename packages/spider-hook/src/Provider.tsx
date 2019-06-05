import React, { ReactChild, useRef, Provider } from 'react'

import {
  createStore,
  Store as InnerStore,
  Slice,
  utils,
  WrapReducer,
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
  resolve: contextError,
  getSlice: contextError,
})

export interface ProviderProps {
  children: ReactChild
  configureStore?: (storeFactory: CreateStore) => InnerStore
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

function createStoreContextContent(
  configureStore: (storeFactory: CreateStore) => InnerStore,
): Store {
  const { wrapReducer, dispatch, resolve } = configureStore(createStore)

  const getSlice = createGetSlice(wrapReducer)

  function hookResolve<T>(selector: Selector<T>) {
    if (utils.isSlice<T>(selector)) {
      return resolve(selector)
    } else {
      return resolve(getSlice(selector))
    }
  }

  function hookDispatch(action: BindableAction) {
    if (typeof action === 'function') {
      return action(hookDispatch, hookResolve)
    } else {
      dispatch(action)
    }
  }

  return {
    wrapReducer,
    resolve: hookResolve,
    dispatch: hookDispatch,
    getSlice,
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
    return mapping.apply(null, sources.map(getSelectorSlice))
  }

  return weakCacheMemo(getSelectorSlice) as typeof getSelectorSlice
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
