import { Slice, createSlice } from './slice'
import { unstack } from './unstack'
import { peekSlice } from './peekSlice'
import { isFunction } from './isFunction'
import {
  Reducer,
  Store,
  Action,
  ActionList,
  Dispatch,
  Dispatchable,
  Middleware,
  RawDispatch,
  MiddlewareAPI,
  RawStore,
} from './types'
import { createNetwork } from './createNetwork'

export interface StateSlice<V> extends Slice<V> {
  nextState(state: V, actions: Action[]): V
  setState(state: V): void
}

function enumerateActions(actions: Dispatchable): Action[] {
  const allActions = [] as Action[]

  if (!actions) return allActions

  if (Array.isArray(actions)) {
    for (const action of actions) {
      // eslint-disable-next-line prefer-spread
      allActions.push.apply(allActions, enumerateActions(action))
    }
  } else {
    allActions.push(actions)
  }

  return allActions
}

const initAction = { type: '@store/init', reducers: [] }

function createRawDispatch(store: RawStore) {
  // apply state updates and mark slices with changed content
  function executeDispatch(actions: Action[], reducer: Reducer) {
    const slice = store.wrapReducer(reducer)
    const oldState = slice.value
    const newState = slice.nextState(oldState, actions)
    slice.setState(newState)
  }

  // propagate updates from all marked slices
  return function internalDispatch(actions: Dispatchable) {
    const receivedActions = enumerateActions(actions)

    const actionsByReducer = new Map<Reducer, Action[]>()

    for (const action of receivedActions) {
      for (const reducer of action.reducers) {
        let actionsTargetingReducer = actionsByReducer.get(reducer)

        if (!actionsTargetingReducer) {
          actionsTargetingReducer = [] as Action[]
          actionsByReducer.set(reducer, actionsTargetingReducer)
        }

        actionsTargetingReducer.push(action)
      }
    }

    actionsByReducer.forEach(executeDispatch)
    store.network.propagate()
  }
}

function createDispatch(store: Store, rawDispatch: RawDispatch) {
  // make it safe to call dispatch in more contexts
  const unstackedDispatch = unstack(rawDispatch)

  // make dispatch aware of thunk actions
  return function dispatch(
    actionable: Action | ActionList | Function,
  ): unknown {
    if (isFunction(actionable)) {
      return actionable(dispatch, store.peek)
    } else {
      unstackedDispatch(actionable)
    }
  } as Dispatch
}

function createPeek(store: Store) {
  return function peek<V>(wrapper: Slice<V> | Reducer<V>) {
    if (isFunction(wrapper)) {
      return peekSlice(store.wrapReducer(wrapper))
    } else {
      return peekSlice(wrapper)
    }
  }
}

function createWrapReducer(store: RawStore) {
  return function wrapReducer<State>(reducer: Reducer<State>) {
    const existingSlice = store.slices.get(reducer)

    if (existingSlice) {
      return existingSlice
    }

    let state = reducer(undefined, initAction)

    const slice = createSlice(
      store.network,
      [],
      () => state,
      state,
    ) as StateSlice<State>

    slice.nextState = function updateState(oldState: State, actions: Action[]) {
      let newState = oldState
      for (const action of actions) {
        newState = reducer(newState, action)
      }
      return newState
    }

    slice.setState = function injectState(newState: State) {
      if (state !== newState) {
        state = newState
        slice.push()
      }
    }

    store.slices.set(reducer, slice)

    return slice
  }
}

export function createStore(...middlewares: Middleware[]): Store {
  const store = {
    network: createNetwork(),
    slices: new Map(),
  } as RawStore

  const { dispatch, ...storeAPI } = middlewares.reduceRight<MiddlewareAPI>(
    (acc, middleware) => Object.assign(acc, middleware(store, acc)),
    {
      wrapReducer: createWrapReducer(store),
      peek: createPeek(store),
      dispatch: createRawDispatch(store),
    },
  )

  Object.assign(store, storeAPI)

  store.dispatch = createDispatch(store, dispatch)

  return store
}
