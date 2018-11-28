export interface Operation<Mixin extends { [operation: string]: Function }> {
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

export { createOperation } from './createOperation'
export { joinOperations } from './joinOperations'

type OperationSetMixin<O extends OperationSet> = O extends Operation<infer M>
  ? M
  : O extends OperationCluster<infer C>
  ? Intersection<C[number] extends Operation<infer M> ? M : never>
  : never

export type OperationSetListMixin<Os extends OperationSet[]> = Intersection<
  OperationSetMixin<Os[number]>
>

export { map } from './map'
export { thru } from './thru'
export { fork } from './fork'
export { dedup } from './dedup'

export type Intersection<Union> = (Union extends infer U
  ? (u: U) => any
  : never) extends (i: infer I) => any
  ? I
  : never
