import { Slice, createSlice } from './slice'
import { unstack } from './unstack'
import { resolveSlice } from './resolveSlice'
import { isFunction } from './isFunction'
import {
  Reducer,
  Store,
  Action,
  ActionList,
  Dispatch,
  Middleware,
  RawDispatch,
  MiddlewareAPI,
  RawStore,
} from './types'
import { createNetwork } from './createNetwork'

export interface StateSlice<V> extends Slice<V> {
  updateState(action: Action): void
  injectState(state: V): void
  sliceName: string
}

export function createStore(...middlewares: Middleware[]): Store {
  const store = {
    network: createNetwork(),
    slices: new Map(),
  } as RawStore

  const storeAPI = middlewares.reduceRight<MiddlewareAPI>(
    (acc, middleware) => Object.assign(acc, middleware(store, acc)),
    {
      wrapReducer: createWrapReducer(store),
      resolve: createResolve(store),
      dispatch: createRawDispatch(store),
    },
  )

  store.wrapReducer = storeAPI.wrapReducer
  store.resolve = storeAPI.resolve
  store.dispatch = createDispatch(store, storeAPI.dispatch)

  return store
}

const initAction = { type: '@store/init', reducers: [] }

function createRawDispatch(store: RawStore) {
  // apply state updates and mark slices with changed content
  function executeDispatch(actions: Action | ActionList) {
    if (Array.isArray(actions)) {
      for (let action of actions) {
        executeDispatch(action)
      }
    } else {
      for (let reducer of actions.reducers) {
        const slice = store.wrapReducer(reducer)
        slice.updateState(actions)
      }
    }
  }

  // propagate updates from all marked slices
  return function internalDispatch(actions: Action | ActionList) {
    executeDispatch(actions)
    store.network.propagate()
  }
}

function createDispatch(store: Store, rawDispatch: RawDispatch) {
  // make it safe to call dispatch in more contexts
  const unstackedDispatch = unstack(rawDispatch)

  // make dispatch aware of thunk actions
  return function dispatch(
    actionable: Action | ActionList | Function,
  ): unknown {
    if (isFunction(actionable)) {
      return actionable(dispatch, store.resolve)
    } else {
      unstackedDispatch(actionable)
    }
  } as Dispatch
}

function createResolve(store: Store) {
  return function resolve<V>(wrapper: Slice<V> | Reducer<V>) {
    if (isFunction(wrapper)) {
      return resolveSlice(store.wrapReducer(wrapper))
    } else {
      return resolveSlice(wrapper)
    }
  }
}

function createWrapReducer(store: RawStore) {
  return function wrapReducer<State>(reducer: Reducer<State>) {
    if (store.slices.has(reducer)) {
      return store.slices.get(reducer)!
    }

    let state = reducer(undefined, initAction)

    const slice = createSlice(
      store.network,
      [],
      _ => state,
      state,
    ) as StateSlice<State>

    slice.updateState = function updateState(action: Action) {
      const oldState = state
      const newState = (state = reducer(state, action))
      if (oldState !== newState) {
        slice.push()
      }
    }

    slice.injectState = function injectState(
      newState = reducer(undefined, initAction),
    ) {
      if (state !== newState) {
        state = newState
        slice.push()
      }
    }

    store.slices.set(reducer, slice)

    return slice
  }
}
