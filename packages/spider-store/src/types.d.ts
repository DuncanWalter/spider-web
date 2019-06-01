import { Slice } from './slice'
import { SwapSet, Subscription } from './SwapSet'
import { StateSlice } from './createStore'

export interface Resolve {
  <V>(wrapper: Slice<V> | Reducer<V, any>): V
}

/**
 * Can be extended using declarations in order
 * to strongly type middleware which modifies the
 * call signature of dispatch.
 */
export interface RawDispatch {
  (action: Action | ActionList): void
}

export interface Dispatch extends RawDispatch {
  <Result>(thunk: (dispatch: Dispatch, resolve: Resolve) => Result): Result
}

export interface RawWrapReducer {
  <S>(reducer: Reducer<S, any>): StateSlice<S>
}

export interface WrapReducer {
  <S>(reducer: Reducer<S, any>): Slice<S>
}

export interface Action {
  type: string
  reducers: Reducer<any, any>[]
}

export interface ActionList extends Array<ActionList | Action> {}

export interface Reducer<State, A extends Action = Action> {
  (state: State | undefined, action: A): State
}

export interface Store {
  dispatch: Dispatch
  resolve: Resolve
  wrapReducer: WrapReducer
}

export interface MiddlewareAPI {
  dispatch: RawDispatch
  resolve: Resolve
  wrapReducer: RawWrapReducer
}

export type Middleware = (
  store: RawStore,
  middlewareAPI: MiddlewareAPI,
) => Partial<MiddlewareAPI>

export interface Network {
  queuedUpdates: SwapSet<Slice<unknown>>
  propagate(): void
}

export interface RawStore extends Store {
  dispatch: Dispatch
  resolve: Resolve
  wrapReducer: RawWrapReducer
  slices: Map<Reducer<any>, StateSlice<any>>
  network: Network
}
