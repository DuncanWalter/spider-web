import { Vertex } from '../vertex/vertex'

declare module '../vertex/vertex' {
  interface Vertex<D = any, I = any, V = D> {
    thru<U>(this: Vertex<D, I, V>, binding: (self: Vertex<D, I, V>) => U): U
  }
}

// TODO: preserve impl type as well for self param
Vertex.prototype.thru = function<D, V, O>(
  this: Vertex<D, any, V>,
  binding: (self: Vertex<D, any, V>) => O,
) {
  return binding(this)
}
