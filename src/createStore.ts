import { PrioritySet } from './prioritySet'
import { Slice, createSlice } from './slice'
import { propagateSlice } from './propagateSlice'

export const sliceKey = '@store/slices'

export interface StateSlice<A> {
  (action: A, marks: PrioritySet<Slice<unknown>>): void
}

export interface Dispatch<A> {
  <R>(a: A | ((d: Dispatch<A>) => R)): R
}

export interface Reducer<S, A> {
  (state: S | undefined, action: A): S
}

export interface Store<A> {
  dispatch: Dispatch<A>
  wrapReducer: <S>(reducer: Reducer<S, A>) => Slice<S>
  [sliceKey]: StateSlice<A>[]
}

/**
 * Creates a state store with a dispatch and
 * a wrapReducer function.
 */
export function createStore<Action extends { type: string }>(): Store<Action> {
  const store = {
    [sliceKey]: [] as StateSlice<Action>[],
  } as Store<Action>

  const dispatch: Dispatch<Action> = <Return>(action: any): Return => {
    if (action instanceof Function) {
      return action(dispatch)
    }
    const marks: PrioritySet<Slice<unknown>> = new PrioritySet()
    store[sliceKey].forEach(slice => slice(action, marks))
    propagateSlice(marks)
    return undefined as any
  }
  store.dispatch = dispatch

  function wrapReducer<State>(
    reducer: (state: State | undefined, action: Action) => State,
    config: {
      shallow?: boolean
      volatile?: boolean
      initialState?: State
    } = {},
  ) {
    const { shallow = true, initialState } = config
    let state =
      initialState || reducer(undefined, { type: '@store/init' } as Action)
    const resource = createSlice([] as Slice[], _ => state, state, shallow)
    store[sliceKey].push((action, marks) => {
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
