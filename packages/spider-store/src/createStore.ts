import { Slice, createSlice, Shallow, didUpdate } from './slice'
import { propagateSlices } from './propagateSlices'
import { createScheduler } from './createScheduler'
import { SliceSet } from './SliceSet'

export interface StateSlice<V> extends Slice<V> {
  updateState(action: Action, marks: SliceSet): void
}

export interface Dispatch {
  (a: Action): Promise<undefined>
  <R>(a: (d: Dispatch) => R): R
}

type ActionLike = Action | ((dispatch: Dispatch) => any)

export interface Action {
  type: string
  reducer?: Reducer<any>
  schedule?(dispatch: Dispatch): any
}

export interface Reducer<State, A extends Action = Action> {
  (state: State | undefined, action: A): State
}

export interface Store {
  dispatch: Dispatch
  wrapReducer: <S>(
    reducer: Reducer<S, any>,
    initialState?: S,
    shallow?: boolean,
  ) => Slice<S>
  slices: Map<Reducer<any>, StateSlice<any>>
}

export function createStore(): Store {
  const slices = new Map<unknown, StateSlice<any>>()

  const store = { slices } as Store

  const scheduleUpdate = createScheduler<[Action, string], void>(actions => {
    const marks = new SliceSet()
    // TODO: use the action stack for some purpose
    for (let [action, type] of actions) {
      if (action.reducer) {
        const slice = slices.get(action.reducer)
        if (slice) slice.updateState(action, marks)
      } else {
        slices.forEach(slice => slice.updateState(action, marks))
      }
    }
    propagateSlices(marks)
  })

  function dispatch(
    action: ActionLike,
    name: string = typeof action === 'function' ? action.name : action.type,
  ): unknown {
    if (typeof action === 'function') {
      return action(((a: Action) => dispatch(a, name)) as Dispatch)
    }
    return scheduleUpdate(action, name)
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

  store.dispatch = dispatch as Dispatch
  store.wrapReducer = wrapReducer
  return store
}
