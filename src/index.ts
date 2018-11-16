import { PrioritySet } from './utils'
import { Vertex } from './vertex'

// TODO: join with other stores
export function createStore<Action extends { type: string }>() {
  const stateSlices: ((
    action: Action,
    marks: PrioritySet<Vertex<any, unknown>>,
  ) => void)[] = []
  function dispatch(action: Action) {
    const marks: PrioritySet<Vertex<any, unknown>> = new PrioritySet()
    stateSlices.forEach(slice => slice(action, marks))
    Vertex.propagate(marks)
  }

  function wrapReducer<State>(
    reducer: (state: State | undefined, action: Action) => State,
    config: {
      shallow?: boolean
      initialState?: State
    } = {},
  ) {
    const { shallow = true, initialState } = config
    let state = initialState || reducer(undefined, { type: '@store/init' })
    const resource = new Vertex([], _ => state, {
      initialValue: initialState,
      shallow,
    })
    stateSlices.push((action, marks) => {
      const oldState = state
      const newState = (state = reducer(state, action))
      if (!shallow || newState !== oldState) {
        resource.revoke()
        marks.add(resource)
      }
    })
    return resource
  }
  return { wrapReducer, dispatch }
}
