import { Slice, createSlice } from './slice'
import { propagateSlices } from './propagateSlices'
import { SliceSet } from './sliceSet'
import { unstack } from './unstack'
import { resolveSlice } from './resolveSlice'
import { isFunction } from './isFunction'
import {
  Reducer,
  Store as SafeStore,
  Action,
  ActionList,
  Dispatch,
  Resolve,
  Middleware,
} from './types'

interface StateSlice<V> extends Slice<V> {
  updateState(action: Action, marks: SliceSet): void
  injectState(state: V, marks: SliceSet): void
  sliceName: string
}

interface Store {
  dispatch: Dispatch
  resolve: Resolve
  wrapReducer: <S>(reducer: Reducer<S, any>) => StateSlice<S>
  slices: Map<Reducer<any>, StateSlice<any>>
}

export function createStore(...middlewares: Middleware[]): SafeStore {
  const store = { slices: new Map() } as Store

  store.wrapReducer = createWrapReducer(store)
  store.resolve = createResolve(store)
  store.dispatch = createDispatch(store, middlewares)

  return store
}

const initAction = { type: '@store/init', reducers: [] }

function createDispatch(store: Store, middlewares: Middleware[]) {
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
  function internalDispatch(actions: Action | ActionList) {
    const marks = new SliceSet()
    executeDispatch(actions, marks)
    propagateSlices(marks)
  }

  // apply middleware chain
  const augmentedDispatch = middlewares
    .map(middleware => middleware(store))
    .reduceRight((next, middleware) => middleware(next), internalDispatch)

  // make it safe to call dispatch in more contexts
  const unstackedDispatch = unstack(augmentedDispatch)

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

function createWrapReducer(store: Store) {
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
