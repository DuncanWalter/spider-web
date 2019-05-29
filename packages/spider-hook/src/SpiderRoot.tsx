import React, { ReactChild, useRef } from 'react'

import {
  createStore,
  Store as InnerStore,
  Slice,
  utils,
  WrapReducer,
} from '@dwalter/spider-store'
import { Selector, Store, BindableAction, CustomSelector } from './types'
import { useShouldUpdate, noop } from './utils'

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

export interface SpiderRootProps {
  children: ReactChild
  configureStore?: (storeFactory: typeof createStore) => InnerStore
}

export function SpiderRoot({
  children,
  configureStore = () => createStore(),
}: SpiderRootProps) {
  const shouldUpdate = useShouldUpdate()

  const { current: store } = useRef<Store>(
    shouldUpdate ? createStoreContextContent(configureStore) : noop,
  )

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

function createStoreContextContent(
  configureStore: (storeFactory: typeof createStore) => InnerStore,
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
  const selectorSlices = new WeakMap<Selector<any>, Slice>()

  function getCustomSelectorSlice<T>(selector: CustomSelector<T>): Slice<T> {
    const { sources, mapping } = selector
    if (selectorSlices.has(selector)) {
      return selectorSlices.get(selector)!
    } else {
      const parents = sources.map(getSelectorSlice)
      const slice = mapping.apply(null, parents)
      selectorSlices.set(selector, slice)
      return slice
    }
  }

  function getSelectorSlice<T>(selector: Selector<T>): Slice<T> {
    if (utils.isSlice<T>(selector)) {
      return selector
    }
    if (typeof selector === 'function') {
      return wrapReducer(selector)
    }
    return getCustomSelectorSlice(selector)
  }

  return getSelectorSlice
}
