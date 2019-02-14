import { Reducer } from '@dwalter/spider-store'

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
    ? (
        ...payload: Payload
      ) => { type: K; reducers: Reducer<State, any>[]; payload: Payload }
    : never
}

export function createReducer<State, Config extends ReducerConfig<State>>(
  initialState: State,
  config: Config,
): [Reducer<State, any>, ActionCreators<State, Config>] {
  const reducers = [reducer]

  function reducer(state = initialState, action: any) {
    const handler = config[action.type]
    if (!handler) {
      return state
    }
    return handler(state, ...action.payload)
  }

  const actions = {} as ActionCreators<State, Config>

  for (let key of Object.keys(config)) {
    actions[key] = function(...payload: Payload<Config[typeof key]>) {
      return { type: key, reducers, payload }
    } as any
  }

  return [reducer, actions]
}
