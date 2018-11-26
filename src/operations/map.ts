import { Slice, createSlice } from '../slice'
import { createOperation } from './createOperation'

interface Map {
  map<U, V, O>(this: Slice<U, O>, mapping: (u: U) => V): Slice<V, O>
  [ops: string]: Function
}

export const map = createOperation({
  map<U, V, O>(this: Slice<U, O>, mapping: (u: U) => V): Slice<V, O> {
    return createSlice([this], ([u]) => mapping(u))
  },
} as Map)
