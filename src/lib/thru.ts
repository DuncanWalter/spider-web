import { Vertex } from '../vertex/vertex'

type Just = number | string | symbol | Object

declare module '../vertex/vertex' {
  interface Vertex<D = any, I = any, V extends Just = any> {
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
