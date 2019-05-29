import {
  Slice,
  Reducer,
  Action,
  ActionList,
  Store as InnerStore,
  Dispatch as InnerDispatch,
  Resolve as InnerResolve,
  WrapReducer,
  createStore,
} from '@dwalter/spider-store'

interface CustomSelector<T> {
  sources: Selector<any>[]
  mapping: (...slices: any) => Slice<T>
}

export type Selector<T = any> = Reducer<T, any> | Slice<T> | CustomSelector<T>

export interface SideEffect<T = any> {
  source: Selector<T>
  effect: (input: T, dispatch: Dispatch, resolve: Resolve) => unknown
  locks: WeakMap<Dispatch, () => () => void>
}

export interface Resolve extends InnerResolve {
  <V>(selector: Selector<V>): V
}

export interface Dispatch extends InnerDispatch {
  <Result>(thunk: (dispatch: Dispatch, resolve: Resolve) => Result): Result
}

export interface Store {
  getSlice<T>(source: Selector<T>): Slice<T>
  dispatch: Dispatch
  resolve: Resolve
  wrapReducer: WrapReducer
}

export interface ThunkAction<Result = any> {
  (dispatch: Dispatch, resolve: Resolve): Result
}

export interface ActionCreator<Args extends any[] = any[]> {
  (...args: Args): Action | ActionList
}

export interface ActionScheduler<Args extends any[] = any[], Result = any> {
  (...args: Args): ThunkAction<Result>
}

export type BindableAction =
  | Action
  | ActionList
  | ActionCreator
  | ActionScheduler

export type CreateStore = typeof createStore
