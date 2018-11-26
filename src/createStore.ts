import { PrioritySet } from './prioritySet'
import { Slice, createSlice } from './slice'
import { propagateSlice } from './propagateSlice'

export const sliceKey = '@store/slices'

export interface StateSlice<A> {
  (action: A, marks: PrioritySet<Slice<unknown>>): void
}

export interface Dispatch<A> {
  (a: A): Promise<undefined>
  (a: A, c: () => undefined): void
  <R>(a: (d: Dispatch<A>) => R): R
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

  let enqueued = false
  let marks: PrioritySet<Slice<unknown>> = new PrioritySet()
  let tasks: (() => unknown)[] = []

  function update() {
    enqueued = false
    propagateSlice(marks)
    marks = new PrioritySet()
    tasks.forEach(task => task())
    tasks = []
  }

  function requestUpdate() {
    if (!enqueued) {
      enqueued = true
      setTimeout(update, 0)
    }
  }

  const dispatch: Dispatch<Action> = <R>(
    action: Action | ((dispatch: Dispatch<Action>) => R),
    callback?: () => unknown,
  ): any => {
    if (action instanceof Function) {
      return action(dispatch)
    }
    store[sliceKey].forEach(slice => slice(action, marks))
    if (callback) {
      tasks.push(callback)
      requestUpdate()
    } else {
      return new Promise(resolve => {
        tasks.push(resolve)
        requestUpdate()
      })
    }
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
