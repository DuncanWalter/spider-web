import { Slice } from './slice'
import { SliceSet } from './sliceSet'

export { Subscription } from './sliceSet'

export interface Resolve {
  <V>(wrapper: Slice<V> | Reducer<V, any>): V
}

export interface Dispatch {
  (action: Action | ActionList): void
  <Result>(thunk: (dispatch: Dispatch, resolve: Resolve) => Result): Result
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
  wrapReducer: <S>(reducer: Reducer<S, any>) => Slice<S>
}

export type Middleware = (
  store: Store,
) => (
  next: (action: Action | ActionList) => void,
) => (action: Action | ActionList) => void

export interface Operation<Mixin extends {}> {
  type: '@slice/operation'
  operation: Mixin
  applied: boolean
}

export interface OperationCluster<Children extends (Operation<any>)[]> {
  type: '@slice/operation-cluster'
  operations: Children
  applied: boolean
}

export type OperationSet = Operation<any> | OperationCluster<any>

type Intersection<Union> = (Union extends infer U
  ? (u: U) => any
  : never) extends (i: infer I) => any
  ? I
  : never

type OperationSetMixin<O extends OperationSet> = O extends Operation<infer M>
  ? M
  : O extends OperationCluster<infer C>
  ? Intersection<C[number] extends Operation<infer M> ? M : never>
  : never

export type OperationSetListMixin<Os extends OperationSet[]> = Intersection<
  OperationSetMixin<Os[number]>
>

/**
 * `Shallow` is a type which represents the policy followed by
 * a `Slice` when determining whether an update should be pushed
 * to subscribers. If `true`, the `Slice` will perform a shallow
 * equality check and only push changes if the old and new values
 * of the `Slice` are not equal. If `false`, the `Slice` will push
 * all updates regardless of whether the value appears to have
 * changed. For cases where `false` is not fine grained enough,
 * a function comparing the old and new values can be passed. If the
 * comparing function returns true, the values are considered equal and
 * the update is not pushed to subscribers.
 */
export type Shallow<V = unknown> = boolean | ((a: V, b: V) => boolean)
