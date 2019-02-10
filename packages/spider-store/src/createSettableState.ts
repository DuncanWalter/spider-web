import { Reducer, Action, Dispatch, Resolve } from './createStore'
import { isFunction } from './isFunction'
import { Shallow } from './slice'

interface SetterAction<State> extends Action {
  newState: State
}

interface Setter<State> {
  (newState: State): Action
  (newState: (state: State) => State): (
    dispatch: Dispatch,
    resolve: Resolve,
  ) => void
  <R>(
    newState: (state: State) => State,
    mapping: (oldState: State, newState: State) => R,
  ): (dispatch: Dispatch, resolve: Resolve) => R
}

const setStateType = '@store/set-state'

export function createSettableState<State>(
  initialState: State,
  shallow = true as Shallow<State>,
): [Reducer<State, any>, Setter<State>] {
  const reducers = [reducer]

  function reducer(state = initialState, action: SetterAction<State>) {
    const { type, newState } = action
    if (type === setStateType) {
      if (action.reducers == reducers) {
        return newState
      }
    }
    return state
  }

  function setState<R>(
    newState: State | ((state: State) => State),
    mapping?: (o: State, n: State) => R,
  ) {
    if (isFunction(newState)) {
      return (dispatch: Dispatch, resolve: Resolve) => {
        const oldState = resolve(reducer)
        const state = newState(oldState)
        dispatch(setState(state) as SetterAction<State>)
        return mapping ? mapping(oldState, state) : undefined
      }
    }
    return { type: setStateType, reducers, newState }
  }

  return [Object.assign(reducer, { shallow }), setState as Setter<State>]
}

export function partialUpdate<StateFragment extends {}>(
  stateFragment: StateFragment | null,
) {
  return <State extends StateFragment>(oldState: State): State =>
    stateFragment === null
      ? oldState
      : Object.assign({}, oldState, stateFragment)
}
