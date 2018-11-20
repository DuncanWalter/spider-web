import { Vertex, VertexConfig, ValueMap } from '../vertex';
export declare const join: import(".").Operation<{
    join<U, Vs extends import("../vertex").__Vertex__<any, any>[], V, O>(this: Vertex<U, O>, vertices: Vs, create: (v: U, ...vs: ValueMap<Vs>) => V, config?: VertexConfig<V> | undefined): import("../vertex").__Vertex__<any, any>;
}>;
