import { Reducer, Action } from './createStore'

type StateUpdate<State> = null | (State extends Object ? Partial<State> : State)

const foo: StateUpdate<number[]> = null

interface Setter<State> {
  (
    newState: StateUpdate<State> | ((state: State) => StateUpdate<State>),
  ): Action
}

// TODO: don't assume partial setting is desired?
export function createSettableState<State>(
  initialState: State,
): [Reducer<State>, Setter<State>] {
  let keys: (keyof State)[] | null = null

  if (typeof initialState === 'object' && !Array.isArray(initialState)) {
    keys = Object.keys(initialState) as (keyof State)[]
  }

  function reducer(state = initialState, action: Action & { newState?: any }) {
    const { type, newState } = action
    if (type === '@store/set-state') {
      if (action.reducer === reducer) {
        if (typeof newState === 'function') {
          return writeState(state, newState(state), keys)
        } else {
          return writeState(state, newState, keys)
        }
      }
    }
    return state
  }

  function setState(
    newState: StateUpdate<State> | ((state: State) => StateUpdate<State>),
  ) {
    return { type: '@store/set-state', reducer, newState }
  }

  return [reducer, setState]
}

function writeState<S extends { [key: string]: any }>(
  state: S,
  newState: S | null,
  keys: null | (keyof S)[],
) {
  if (newState === null) {
    return state
  }
  if (keys) {
    const result: S = {} as S
    for (let key of keys) {
      result[key] = newState.hasOwnProperty(key) ? newState[key] : state[key]
    }
    return result
  } else {
    return newState
  }
}
