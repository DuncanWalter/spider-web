import { Action } from './types'

interface Reducer<State> {
  (state: State | undefined, action: { type: string }): State
}

type ReducerConfig<State = any> = Record<string, Handler<State, any[]>>

interface Handler<State = any, Payload extends any[] = any[]> {
  (state: State, ...payload: Payload): State
}

type ConfigState<Config extends ReducerConfig> = Config extends ReducerConfig<
  infer State
>
  ? State
  : never

type ActionCreators<State, Config extends ReducerConfig<State>> = {
  [K in keyof Config]: Config[K] extends (
    state: State,
    ...payload: infer Payload
  ) => State
    ? (...payload: Payload) => Action
    : never
}

function defaultNamer(prefix: string) {
  return function(name: string) {
    return `@${prefix}/${name}`
  }
}

/**
 * Function for declaring a reducer with behaviors for
 * a number of known actions.
 * @param name prefix for action types for logging purposes
 * @param initialState starting state of the reducer
 * @param config reducer behaviors for actions
 */
export function createReducer<Config extends ReducerConfig<any>>(
  name: string | ((name: string) => string),
  initialState: ConfigState<Config>,
  config: Config,
): [Reducer<ConfigState<Config>>, ActionCreators<ConfigState<Config>, Config>] {
  const reducerName = typeof name === 'string' ? name : `${name.name}Reducer`

  const handlerKeys = {} as { [actionType: string]: string }

  const reducer = function(state = initialState, action: any) {
    const handlerKey = handlerKeys[action.type]
    if (!handlerKey) {
      return state
    }
    const handler = config[handlerKey]
    if (!handler) {
      return state
    }
    return handler(state, ...action.payload)
  }

  const reducers = [reducer]

  let typeName: (name: string) => string
  if (typeof name === 'function') {
    typeName = name
  } else {
    typeName = defaultNamer(name)
  }

  const actions = {} as any

  for (const key of Object.keys(config)) {
    const type = typeName(key)
    handlerKeys[type] = key
    actions[key] = function(...payload: any[]) {
      return { type, payload, reducers }
    }
  }

  Object.defineProperty(reducer, 'name', {
    value: reducerName,
    enumerable: false,
  })

  return [reducer, actions]
}
