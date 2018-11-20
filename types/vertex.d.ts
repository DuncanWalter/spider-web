import { OperationSet, OperationSetListMixin } from './operations';
export declare type ValueMap<Vs extends Vertex[]> = {
    [K in keyof Vs]: Vs[K] extends Vertex<infer Value> ? Value : never;
};
declare type VertexMixin<Vs extends Vertex<any, any>[]> = Vs extends Array<Vertex<any, infer M>> ? M : never;
export declare type VertexConfig<V> = {
    initialValue?: V;
    shallow?: boolean;
    lazy?: boolean;
    volatile?: boolean;
};
declare type Revokable = Vertex | {
    type: '@vertex/subscription';
    revoke(): unknown;
};
export declare type Vertex<Value = any, Ops = {}> = __Vertex__<any, Value> & Ops;
export declare class __Vertex__<Ds extends Vertex<any, any>[], V> {
    id: number;
    type: undefined;
    children: (null | Revokable)[];
    childCount: number;
    create: (dependencies: ValueMap<Ds>) => V | null;
    revoked: boolean;
    subscriptions: number[];
    dependencies: Ds;
    cachedOutput: V;
    volatile?: boolean;
    shallow?: boolean;
    lazy?: boolean;
    constructor(dependencies: Ds, create: (inputs: ValueMap<Ds>) => V | null, config?: VertexConfig<V>);
    revoke(): void;
    tryUpdate(): boolean;
    subscribe(newChild: Revokable | ((v: V) => unknown)): number;
    unsubscribe(subscription: number): void;
    use<M, Os extends OperationSet[]>(this: Vertex<V, M>, ...operations: Os): Vertex<V, M & OperationSetListMixin<Os>>;
}
export declare function createVertex<Ds extends Vertex[], V>(dependencies: Ds, create: (inputs: ValueMap<Ds>) => V, config?: VertexConfig<V>): Vertex<V, VertexMixin<Ds>>;
export declare function createVertex<Ds extends Vertex[], V>(dependencies: Ds, create: (inputs: ValueMap<Ds>) => V | null, config: {
    initialValue: V;
} & VertexConfig<V>): Vertex<V, VertexMixin<Ds>>;
export {};
