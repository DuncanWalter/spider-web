export interface Operation<Mixin extends {
    [operation: string]: Function;
}> {
    type: '@vertex/operation';
    operation: Mixin;
    applied: boolean;
}
export interface OperationCluster<Children extends (Operation<any>)[]> {
    type: '@vertex/operation-cluster';
    operations: Children;
    applied: boolean;
}
export declare type OperationSet = Operation<any> | OperationCluster<any>;
export { createOperation } from './createOperation';
declare type OperationSetMixin<O extends OperationSet> = O extends Operation<infer M> ? M : O extends OperationCluster<infer C> ? Intersection<C[number] extends Operation<infer M> ? M : never> : never;
export declare type OperationSetListMixin<Os extends OperationSet[]> = Intersection<OperationSetMixin<Os[number]>>;
export { map } from './map';
export { join } from './join';
export declare type Intersection<Union> = (Union extends infer U ? (u: U) => any : never) extends (i: infer I) => any ? I : never;
