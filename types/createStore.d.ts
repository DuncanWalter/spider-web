import { PrioritySet } from './prioritySet';
import { Vertex } from './vertex';
export declare const sliceKey = "@store/slices";
export interface Slice<A> {
    (action: A, marks: PrioritySet<Vertex<unknown>>): void;
}
export interface Dispatch<A> {
    <R>(a: A | ((d: Dispatch<A>) => R)): R;
}
export interface Reducer<S, A> {
    (state: S | undefined, action: A): S;
}
export interface Store<A> {
    dispatch: Dispatch<A>;
    wrapReducer: <S>(reducer: Reducer<S, A>) => Vertex<S>;
    [sliceKey]: Slice<A>[];
}
/**
 * Creates a state store with a dispatch and
 * a wrapReducer function.
 */
export declare function createStore<Action extends {
    type: string;
}>(): Store<Action>;
