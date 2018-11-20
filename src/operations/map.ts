import { Vertex, createVertex } from '../vertex'
import { createOperation } from './createOperation'

export const map = createOperation({
  map<U, V, O>(this: Vertex<U, O>, mapping: (u: U) => V): Vertex<V, O> {
    return createVertex([this], ([u]) => mapping(u))
  },
})
