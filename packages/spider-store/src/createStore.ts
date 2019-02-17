import { Slice, createSlice } from './slice'
import { propagateSlices } from './propagateSlices'
import { SliceSet } from './SliceSet'
import { unstack } from './unstack'
import { resolveSlice } from './resolveSlice'
import { isFunction } from './isFunction'

export interface StateSlice<V> extends Slice<V> {
  updateState(action: Action, marks: SliceSet): void
}

export interface Resolve {
  <V>(wrapper: Slice<V> | Reducer<V, any>): V
}

export interface Dispatch {
  (action: Action | ActionList): void
  <Result>(thunk: (dispatch: Dispatch, resolve: Resolve) => Result): Result
}

export interface Action {
  type: string
  reducers: Reducer<any, any>[]
}

export interface ActionList extends Array<ActionList | Action> {}

export interface Reducer<State, A extends Action = Action> {
  (state: State | undefined, action: A): State
}

export interface Store {
  dispatch: Dispatch
  resolve: Resolve
  wrapReducer: <S>(reducer: Reducer<S, any>) => StateSlice<S>
  slices: Map<Reducer<any>, StateSlice<any>>
}

export function createStore(): Store {
  const slices = new Map<Reducer<any>, StateSlice<any>>()

  const store = { slices } as Store

  function dispatch(actions: Action | ActionList, marks: SliceSet): void {
    if (Array.isArray(actions)) {
      for (let action of actions) {
        dispatch(action, marks)
      }
    } else {
      for (let reducer of actions.reducers) {
        const slice = slices.get(reducer) || store.wrapReducer(reducer)
        slice.updateState(actions, marks)
      }
    }
  }

  function rootDispatch(actions: Action | ActionList) {
    const marks = new SliceSet()
    dispatch(actions, marks)
    propagateSlices(marks)
  }

  const unstackedDispatch = unstack(rootDispatch)

  function resolve<V>(wrapper: Slice<V> | Reducer<V>) {
    if (isFunction(wrapper)) {
      const slice = slices.get(wrapper)
      if (slice) {
        return resolveSlice(slice)
      } else {
        return wrapper(undefined, { type: '@store/resolve', reducers: [] })
      }
    } else {
      return resolveSlice(wrapper)
    }
  }

  function safeDispatch(actionable: Action | ActionList | Function): unknown {
    if (isFunction(actionable)) {
      return actionable(safeDispatch, resolve)
    } else {
      unstackedDispatch(actionable)
    }
  }

  function wrapReducer<State>(reducer: Reducer<State>) {
    if (slices.get(reducer)) return slices.get(reducer)!

    let state = reducer(undefined, { type: '@store/init', reducers: [] })

    const slice = createSlice([] as Slice[], _ => state, state) as StateSlice<
      State
    >

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
  store.resolve = resolve
  store.wrapReducer = wrapReducer
  return store
}
