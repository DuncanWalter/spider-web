import { Operation } from '.';
export declare function createOperation<Mixin extends {
    [operation: string]: Function;
}>(mixin: Mixin): Operation<Mixin>;
