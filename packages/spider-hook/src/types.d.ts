import {
  Slice,
  Reducer,
  Action,
  ActionList,
  Dispatch as InnerDispatch,
  Peek as InnerPeek,
  WrapReducer,
  createStore,
} from '@dwalter/spider-store'

interface CustomSelector<T> {
  sources: Selector<any>[]
  mapping: (...slices: any) => Slice<T>
}

export type Selector<T = any> = Reducer<T> | Slice<T> | CustomSelector<T>

export interface SideEffect<T = any> {
  source: Selector<T>
  effect: (input: T, dispatch: Dispatch, peek: Peek) => unknown
  locks: WeakMap<Dispatch, () => () => void>
}

export interface Peek extends InnerPeek {
  <V>(selector: Selector<V>): V
}

export interface Dispatch extends InnerDispatch {
  <Result>(thunk: (dispatch: Dispatch, peek: Peek) => Result): Result
}

export interface Store {
  getSlice<T>(source: Selector<T>): Slice<T>
  dispatch: Dispatch
  peek: Peek
  wrapReducer: WrapReducer
}

export interface ThunkAction<Result = any> {
  (dispatch: Dispatch, peek: Peek): Result
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
