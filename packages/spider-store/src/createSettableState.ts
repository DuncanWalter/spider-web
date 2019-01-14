import { Reducer, Action } from './createStore'

interface Setter<State> {
  (newState: State | ((state: State) => State)): Action
}

const setStateType = '@store/set-state'

export function createSettableState<State>(
  initialState: State,
): [Reducer<State>, Setter<State>] {
  function reducer(state = initialState, action: Action & { newState?: any }) {
    const { type, newState } = action
    if (type === setStateType) {
      if (action.reducer === reducer) {
        if (typeof newState === 'function') {
          return newState(state)
        } else {
          return newState
        }
      }
    }
    return state
  }

  function setState(newState: State | ((state: State) => State)) {
    return { type: setStateType, reducer, newState }
  }

  return [reducer, setState]
}

export function partialUpdate<StateFragment extends {}>(
  stateFragment: StateFragment | null,
) {
  return <State extends StateFragment>(oldState: State): State =>
    stateFragment === null
      ? oldState
      : Object.assign({}, oldState, stateFragment)
}
