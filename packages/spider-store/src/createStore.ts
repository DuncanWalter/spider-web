import { Slice, createSlice } from './slice'
import { propagateSlice } from './propagateSlice'
import { createScheduler } from './createScheduler'
import { SliceSet } from './SliceSet'

export const sliceKey = '@store/slices'

export interface StateSlice<A> {
  (action: A, marks: SliceSet): void
}

// interface SetState<State = unknown> {
//   type: '@store/set-state'
//   target: Slice<State>
//   newState: State | ((state: State) => State)
// }

export interface Dispatch<A> {
  (a: A): Promise<undefined>
  (a: Promise<A>): Promise<undefined>
  <R>(a: (d: Dispatch<A>) => R): R
}

export type Actionable<A> =
  | A
  | Promise<A>
  | ((dispatch: Dispatch<A>) => unknown)

export interface Reducer<S, A> {
  (state: S | undefined, action: A): S
}

export interface Store<A> {
  dispatch: Dispatch<A>
  wrapReducer: <S>(reducer: Reducer<S, A>) => Slice<S>
  // wrapState: <S>(
  //   state: S | ((s: S) => S),
  // ) => [Slice<S>, (state: S | ((s: S) => S)) => Actionable<A>]
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

export function createStore<Action extends { type: string }>(
  ...enhancers: ((store: Store<Action>) => unknown)[]
): Store<Action> {
  const store = {
    slices: [] as StateSlice<Action>[],
  } as Store<Action>

  store.master = store

  const scheduleUpdate = createScheduler<(marks: SliceSet) => unknown>(
    tasks => {
      const marks = new SliceSet()
      for (let task of tasks) {
        task(marks)
      }
      propagateSlice(marks)
    },
  )

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

    return new Promise(resolve => {
      scheduleUpdate(marks => {
        getMaster(store).slices.forEach(slice => slice(action, marks))
        resolve()
      })
    })
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

  // function wrapState<State>(
  //   initialState: State,
  // ): [
  //   Slice<State>,
  //   (
  //     newState: State | ((state: State) => State),
  //   ) => (dispatch: Dispatch<Action>) => unknown
  // ] {
  //   const slice = wrapReducer<State>((state = initialState, action: Action) => {
  //     if (action.type === '@store/set-state') {
  //       if (action.target === slice) {
  //         if (action.newState instanceof Function) {
  //           return action.newState(state)
  //         } else {
  //           return action.newState
  //         }
  //       }
  //     }
  //     return state
  //   })

  //   function setState(newState: State | ((state: State) => State)) {
  //     return (dispatcher: Dispatch<Action>) =>
  //       dispatcher({ type: '@store/set-state', target: slice, newState })
  //   }

  //   return [slice, setState]
  // }

  // store.wrapState = wrapState

  enhancers.forEach(enhancer => enhancer(store))

  return store
}
