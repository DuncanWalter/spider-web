import { PrioritySet } from './prioritySet'
import { Vertex } from './vertex'

// TODO: join with other stores?
export function createStore<Action extends { type: string }>() {
  let stateSlices: ((
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
      volatile?: boolean
      initialState?: State
    } = {},
  ) {
    const { shallow = true, volatile = false, initialState } = config
    let state =
      initialState || reducer(undefined, { type: '@store/init' } as Action)
    const resource = new Vertex([], _ => state, {
      initialValue: state,
      shallow,
      volatile,
    })
    stateSlices.push((action, marks) => {
      const oldState = state
      const newState = (state = reducer(state, action))
      if (newState === undefined) {
        throw new Error('Reducer returned undefined')
      }
      if (!shallow || newState !== oldState) {
        resource.revoke()
        marks.add(resource)
      }
    })
    return resource
  }
  return { wrapReducer, dispatch }
}

/**
 * TODO: Project component for React which allows you to live
 * render components based on state and automatically handles
 * subscription logic. May also/alternatively be implemented
 * as an HOC function.
 *
 * project([counters.fork(cs => cs)], counters => {
 *    counters.map(counter =>
 *      project([counter], c => (
 *        <div key={c.name}>{`${c.name}: ${c.value}`}</div>
 *      ))
 *    )
 * })
 */
