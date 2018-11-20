import { Vertex } from '../vertex'
import { createOperation } from './createOperation'

export const thru = createOperation({
  thru<U, V, O>(this: Vertex<U, O>, binding: (self: Vertex<U, O>) => V): V {
    return binding(this)
  },
})
