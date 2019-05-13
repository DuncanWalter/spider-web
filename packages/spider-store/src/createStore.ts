import { Slice, createSlice } from './slice'
import { propagateSlices } from './propagateSlices'
import { SliceSet } from './sliceSet'
import { unstack } from './unstack'
import { resolveSlice } from './resolveSlice'
import { isFunction } from './isFunction'
import {
  Reducer,
  Store,
  Action,
  ActionList,
  Dispatch,
  Resolve,
  Middleware,
  RawDispatch,
  MiddlewareAPI,
  WrapReducer,
  RawStore,
} from './types'

export interface StateSlice<V> extends Slice<V> {
  updateState(action: Action, marks: SliceSet): void
  injectState(state: V, marks: SliceSet): void
  sliceName: string
}

export function createStore(...middlewares: Middleware[]): Store {
  const store = { slices: new Map() } as RawStore

  // TODO: ADD WARNING FUNCTION TO STORE TO BE OVERWRITTEN

  const foo = middlewares.reduceRight<MiddlewareAPI>(
    (acc, middleware) => Object.assign(acc, middleware(store, acc)),
    {
      wrapReducer: createWrapReducer(store),
      resolve: createResolve(store),
      dispatch: createRawDispatch(store),
    },
  )

  store.wrapReducer = foo.wrapReducer
  store.resolve = foo.resolve
  store.dispatch = createDispatch(store, foo.dispatch)

  return store
}

const initAction = { type: '@store/init', reducers: [] }

function createRawDispatch(store: RawStore) {
  // apply state updates and mark slices with changed content
  function executeDispatch(actions: Action | ActionList, marks: SliceSet) {
    if (Array.isArray(actions)) {
      for (let action of actions) {
        executeDispatch(action, marks)
      }
    } else {
      for (let reducer of actions.reducers) {
        const slice = store.wrapReducer(reducer)
        slice.updateState(actions, marks)
      }
    }
  }

  // propagate updates from all marked slices
  return function internalDispatch(actions: Action | ActionList) {
    const marks = new SliceSet()
    executeDispatch(actions, marks)
    propagateSlices(marks)
  }

  // // apply middleware chain
  // const augmentedDispatch = middlewares
  //   .map(middleware => middleware(store))
  //   .reduceRight((next, middleware) => middleware(next), internalDispatch)
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

    const slice = createSlice([], _ => state, state) as StateSlice<State>

    slice.updateState = function updateState(action: Action, marks: SliceSet) {
      const oldState = state
      const newState = (state = reducer(state, action))
      if (oldState !== newState) {
        marks.add(slice)
      }
    }

    slice.injectState = function injectState(
      newState = reducer(undefined, initAction),
      marks: SliceSet,
    ) {
      if (state !== newState) {
        marks.add(slice)
        state = newState
      }
    }

    store.slices.set(reducer, slice)

    return slice
  }
}
