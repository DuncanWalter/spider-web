import { Reducer, Action } from './createStore'
import { Shallow } from '../lib'

interface Setter<State> {
  (newState: State | ((state: State) => State)): Action
}

const setStateType = '@store/set-state'

export function createSettableState<State>(
  name: string,
  initialState: State,
  shallow = true as Shallow<State>,
): [Reducer<State>, Setter<State>] {
  const reducer = {
    [name](state = initialState, action: Action & { newState?: any }) {
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
    },
  }[name]

  function setState(newState: State | ((state: State) => State)) {
    return { type: setStateType, reducer, newState }
  }

  return [Object.assign(reducer, { shallow }), setState]
}

export function partialUpdate<StateFragment extends {}>(
  stateFragment: StateFragment | null,
) {
  return <State extends StateFragment>(oldState: State): State =>
    stateFragment === null
      ? oldState
      : Object.assign({}, oldState, stateFragment)
}
