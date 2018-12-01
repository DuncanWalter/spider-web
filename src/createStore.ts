import { Slice, createSlice } from './slice'
import { propagateSlice } from './propagateSlice'
import { createRequester } from './createRequester'
import { SliceSet } from './SliceSet'

export const sliceKey = '@store/slices'

export interface StateSlice<A> {
  (action: A, marks: SliceSet): void
}

export interface Dispatch<A> {
  (a: A): Promise<undefined>
  (a: Promise<A>): Promise<undefined>
  <R>(a: (d: Dispatch<A>) => R): R
}

export interface Reducer<S, A> {
  (state: S | undefined, action: A): S
}

export interface Store<A> {
  dispatch: Dispatch<A>
  wrapReducer: <S>(reducer: Reducer<S, A>) => Slice<S>
  slices: StateSlice<A>[]
  master: Store<any>
}

export function getMaster(store: Store<any>) {
  let s = store
  while (s.master !== s) {
    s = s.master
  }
  return s
}

export function createStore<Action extends { type: string }>(): Store<Action> {
  const store = {
    slices: [] as StateSlice<Action>[],
  } as Store<Action>

  store.master = store

  let marks: SliceSet = new SliceSet()

  const requestResolve = createRequester(() => {
    propagateSlice(marks)
    marks = new SliceSet()
  })

  const dispatch: Dispatch<Action> = <R>(
    action: Action | Promise<Action> | ((dispatch: Dispatch<Action>) => R),
  ) => {
    if (action instanceof Promise) {
      return new Promise(resolve => {
        action.then(action => dispatch(action).then(resolve))
      })
    }
    if (action instanceof Function) {
      return action(dispatch)
    }
    getMaster(store).slices.forEach(slice => slice(action, marks))
    return new Promise(requestResolve)
  }
  store.dispatch = dispatch

  function wrapReducer<State>(
    reducer: (state: State | undefined, action: Action) => State,
    config: {
      shallow?: boolean
      initialState?: State
    } = {},
  ) {
    const { shallow = true, initialState } = config
    let state =
      initialState || reducer(undefined, { type: '@store/init' } as Action)
    const resource = createSlice([] as Slice[], _ => state, state, shallow)
    getMaster(store).slices.push((action, marks) => {
      const oldState = state
      const newState = (state = reducer(state, action))
      if (newState === undefined) {
        throw new Error('Reducer returned undefined')
      }
      if (!shallow || newState !== oldState) {
        marks.add(resource)
      }
    })
    return resource
  }
  store.wrapReducer = wrapReducer
  return store
}
