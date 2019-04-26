import {
  Slice,
  Reducer,
  Dispatch,
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
  <V>(wrapper: Source<V>): V
}

export interface Store extends InnerStore {
  getSlice<T>(source: Source<T>): Slice<T>
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
