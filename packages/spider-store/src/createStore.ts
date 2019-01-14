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

interface ListLink<T> {
  next: List<T>
  value: T
}

type List<T> = { next: null; value: null } | ListLink<T>

type ActionLike = Action | Promise<Action> | ((dispatch: Dispatch) => any)

export interface Action {
  type: string
  reducer?: Reducer<any>
  action?: ActionLike
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

  const scheduleUpdate = createScheduler<[Action], void>(actions => {
    const marks = new SliceSet()
    // TODO: use the action stack for some purpose
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

  function dispatch(
    action: ActionLike,
    // TODO: use in some real way
    stack: List<Action> = { next: null, value: null },
  ): unknown {
    if (action instanceof Promise) {
      return action.then(action => dispatch(action, stack))
    }
    if (typeof action === 'function') {
      return action(((a: ActionLike) => dispatch(a, stack)) as Dispatch)
    }
    if (action.action) {
      return dispatch(action.action, { next: stack, value: action })
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

  store.dispatch = dispatch as Dispatch
  store.wrapReducer = wrapReducer
  store.getState = getState
  return store
}
