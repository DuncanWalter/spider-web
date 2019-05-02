import {
  Slice,
  Reducer,
  Store as InnerStore,
  Action,
  ActionList,
} from '@dwalter/spider-store'

export interface Selector<T = any> {
  sources: Source<any>[]
  mapping: (...slices: any) => Slice<T>
}

export type Source<T = any> = Reducer<T, any> | Selector<T>

export interface SideEffect<T = any> {
  source: Source<T>
  effect: (input: T, dispatch: Dispatch, resolve: Resolve) => unknown
  locks: WeakMap<Dispatch, () => () => void>
}

export interface Resolve {
  <V>(source: Source<V>): V
}

export interface Dispatch {
  (action: Action | ActionList): void
  <Result>(thunk: (dispatch: Dispatch, resolve: Resolve) => Result): Result
}

export interface Store extends InnerStore {
  getSlice<T>(source: Source<T>): Slice<T>
  hookDispatch: Dispatch
  hookResolve: Resolve
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
