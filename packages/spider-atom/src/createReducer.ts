import { Reducer, Action } from '@dwalter/spider-store'

interface ReducerConfig<State = any>
  extends Record<string, Handler<State, any[]>> {}

interface Handler<State = any, Payload extends any[] = any[]> {
  (state: State, ...payload: Payload): State
}

type Payload<H extends Handler> = H extends Handler<any, infer P> ? P : never

type ActionCreators<State, Config extends ReducerConfig<State>> = {
  [K in keyof Config]: Config[K] extends (
    state: State,
    ...payload: infer Payload
  ) => State
    ? (...payload: Payload) => Action
    : never
}

/**
 * Function for declaring a reducer with behaviors for
 * a number of known actions.
 * @param name prefix for action types for logging purposes
 * @param initialState starting state of the reducer
 * @param config reducer behaviors for actions
 */
export function createReducer<State, Config extends ReducerConfig<State>>(
  name: string,
  initialState: State,
  config: Config,
): [Reducer<State>, ActionCreators<State, Config>] {
  const reducers = [reducer]

  function reducer(state = initialState, action: any) {
    const handler = action.key && config[action.key]
    if (!handler) {
      return state
    }
    return handler(state, ...action.payload)
  }

  const actions = {} as ActionCreators<State, Config>

  for (let key of Object.keys(config)) {
    actions[key] = function(...payload: Payload<Config[typeof key]>) {
      return { type: `@${name}/${key}`, key, reducers, payload }
    } as any
  }

  return [reducer, actions]
}
