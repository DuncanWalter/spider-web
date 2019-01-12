import { Slice, createSlice, Shallow, didUpdate } from './slice'
import { propagateSlice } from './propagateSlice'
import { createScheduler } from './createScheduler'
import { SliceSet } from './SliceSet'

export interface StateSlice<V> extends Slice<V> {
  updateState(action: Action, marks: SliceSet): void
}

export interface Dispatch<A = Action> {
  (a: A): Promise<undefined>
  (a: Promise<A>): Promise<undefined>
  <R>(a: (d: Dispatch<A>) => R): R
}

export interface Action {
  type: string
  reducer?: Reducer<any>
  // TODO: hook in this API
  action?: Action | ((dispatch: Dispatch) => unknown)
}

export interface Reducer<State, A extends Action = Action> {
  (state: State | undefined, action: A): State
}

export interface Store<A extends Action = Action> {
  dispatch: Dispatch<A>
  wrapReducer: <S>(
    reducer: Reducer<S, any>,
    initialState?: S,
    shallow?: boolean,
  ) => Slice<S>
  slices: Map<Reducer<any>, StateSlice<any>>
  getState: () => unknown
}

export function createStore<A extends Action>(): Store<A> {
  const store = {
    slices: new Map(),
  } as Store<A>

  const slices = store.slices

  const scheduleUpdate = createScheduler<[A], void>(actions => {
    const marks = new SliceSet()
    for (let [action] of actions) {
      if (action.reducer) {
        const slice = slices.get(action.reducer)
        if (slice) slice.updateState(action, marks)
      } else {
        slices.forEach(slice => slice.updateState(action, marks))
      }
    }
    propagateSlice(marks)
  })

  // TODO: let actionDepth = 0
  const dispatch: Dispatch<A> = <R>(
    action: A | Promise<A> | ((dispatch: Dispatch<A>) => R),
  ) => {
    if (action instanceof Promise) {
      return action.then(action => dispatch(action))
    }
    if (typeof action === 'function') {
      return action(dispatch)
    }
    return scheduleUpdate(action)
  }

  // TODO: return to a configuration object
  // and add slice name field
  function wrapReducer<State>(
    reducer: Reducer<State>,
    initialState?: State,
    shallow: Shallow<State> = true,
  ) {
    let state = initialState || reducer(undefined, { type: '@store/init' })

    const slice = createSlice(
      [] as Slice[],
      _ => state,
      state,
      shallow,
    ) as StateSlice<State>

    function updateState(action: Action, marks: SliceSet) {
      const oldState = state
      const newState = (state = reducer(state, action))
      if (didUpdate(shallow, oldState, newState)) {
        marks.add(slice)
      }
    }

    slice.updateState = updateState

    slices.set(reducer, slice)

    return slice
  }

  // TODO: pretty this up; make it actually useful
  function getState() {
    const state: { [key: string]: unknown } = {}
    slices.forEach((slice, reducer) => {
      state[reducer.name] = slice.value
    })
    return state
  }

  store.dispatch = dispatch
  store.wrapReducer = wrapReducer
  store.getState = getState
  return store
}
