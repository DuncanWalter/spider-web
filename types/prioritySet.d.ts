import * as FlatQueue from 'flatqueue';
export declare class PrioritySet<T extends {
    id: number;
}> {
    set: Set<T>;
    priorityQueue: FlatQueue<T>;
    constructor();
    add(t: T): void;
    has(t: T): boolean;
    pop(): T;
    readonly size: number;
}
