import { Slice, createSlice } from './slice'
import { propagateSlice } from './propagateSlice'
import { createScheduler } from './createScheduler'
import { SliceSet } from './SliceSet'

export interface StateSlice<A> {
  (action: A, marks: SliceSet): void
}

export interface Dispatch<A = Action> {
  (a: A): Promise<undefined>
  (a: Promise<A>): Promise<undefined>
  <R>(a: (d: Dispatch<A>) => R): R
}

export interface Action {
  type: string
  reducer?: Reducer<any>
}

export interface Reducer<State> {
  (state: State | undefined, action: Action): State
}

export interface Store<A extends Action> {
  dispatch: Dispatch<A>
  wrapReducer: <S>(
    reducer: Reducer<S>,
    initialState?: S,
    shallow?: boolean,
  ) => Slice<S>
  slices: Map<unknown, StateSlice<A>>
  master: Store<Action> | null
  with<Self, Return>(this: Self, enhancer: (self: Self) => Return): Return
}

// TODO: on the chopping block
export function getMaster(store: Store<any>) {
  let s = store
  while (s.master !== null) {
    s = s.master
  }
  if (s !== store) {
    store.master = s
  }
  return s
}

export function createStore<A extends Action>(): Store<A> {
  const store = {
    slices: new Map(),
    master: null,
    with(enhancer) {
      return enhancer(this)
    },
  } as Store<A>

  const scheduleUpdate = createScheduler<A, void>(actions => {
    const marks = new SliceSet()
    for (let action of actions) {
      const slices = getMaster(store).slices
      if (action.reducer) {
        slices.get(action.reducer)!(action, marks)
      } else {
        slices.forEach(slice => slice(action, marks))
      }
    }
    propagateSlice(marks)
  })

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

  function wrapReducer<State>(
    reducer: Reducer<State>,
    initialState?: State,
    shallow: boolean = true,
  ) {
    let state = initialState || reducer(undefined, { type: '@store/init' } as A)

    const resource = createSlice([] as Slice[], _ => state, state, shallow)

    getMaster(store).slices.set(reducer, (action, marks) => {
      const oldState = state
      const newState = (state = reducer(state, action))
      if (newState === undefined) {
        throw new Error('Reducer returned undefined')
      }
      if (newState === null) {
        throw new Error('Reducer returned null')
      }
      if (!shallow || newState !== oldState) {
        marks.add(resource)
      }
    })

    return resource
  }

  store.dispatch = dispatch
  store.wrapReducer = wrapReducer
  return store
}
