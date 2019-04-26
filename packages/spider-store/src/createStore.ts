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
}

interface Store {
  dispatch: Dispatch
  resolve: Resolve
  wrapReducer: <S>(reducer: Reducer<S, any>) => StateSlice<S>
  slices: Map<Reducer<any>, StateSlice<any>>
}

export function createStore(...middlewares: Middleware[]): SafeStore {
  const store = { slices: new Map() } as Store

  const { slices } = store

  function dispatch(actions: Action | ActionList, marks: SliceSet) {
    if (Array.isArray(actions)) {
      for (let action of actions) {
        dispatch(action, marks)
      }
    } else {
      for (let reducer of actions.reducers) {
        const slice = store.wrapReducer(reducer)
        slice.updateState(actions, marks)
      }
    }
  }

  function rootDispatch(actions: Action | ActionList) {
    const marks = new SliceSet()
    dispatch(actions, marks)
    propagateSlices(marks)
  }

  const appliedDispatch = middlewares
    .map(middleware => middleware(store))
    .reduceRight((next, middleware) => middleware(next), rootDispatch)

  const unstackedDispatch = unstack(appliedDispatch)

  function safeDispatch(actionable: Action | ActionList | Function): unknown {
    if (isFunction(actionable)) {
      return actionable(safeDispatch, store.resolve)
    } else {
      unstackedDispatch(actionable)
    }
  }

  function resolve<V>(wrapper: Slice<V> | Reducer<V>) {
    if (isFunction(wrapper)) {
      return resolveSlice(store.wrapReducer(wrapper))
    } else {
      return resolveSlice(wrapper)
    }
  }

  function wrapReducer<State>(reducer: Reducer<State>) {
    if (slices.get(reducer)) return slices.get(reducer)!

    let state = reducer(undefined, { type: '@store/init', reducers: [reducer] })

    const slice = createSlice([], _ => state, state) as StateSlice<State>

    function updateState(action: Action, marks: SliceSet) {
      const oldState = state
      const newState = (state = reducer(state, action))
      if (oldState !== newState) {
        marks.add(slice)
      }
    }

    slice.updateState = updateState

    slices.set(reducer, slice)

    return slice
  }

  store.dispatch = safeDispatch as Dispatch
  store.resolve = resolve as Resolve
  store.wrapReducer = wrapReducer
  return store
}
