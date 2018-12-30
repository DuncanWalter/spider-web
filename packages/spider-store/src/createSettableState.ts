import { Reducer, Action } from './createStore'

export function createSettableState<State>(
  initialState: State,
): [Reducer<State>, (newState: State | ((state: State) => State)) => Action] {
  function reducer(state = initialState, action: Action & { newState?: any }) {
    const { type, newState } = action
    if (type === '@store/set-state') {
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
    return { type: '@store/set-state', reducer, newState }
  }

  return [reducer, setState]
}
