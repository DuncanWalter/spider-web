import { Vertex } from '../vertex/vertex'

declare module '../vertex/vertex' {
  interface Vertex<Ds, V> {
    thru<U>(this: Vertex<Ds, V>, binding: (self: Vertex<Ds, V>) => U): U
  }
}

Vertex.prototype.thru = function<Ds extends Vertex<any, any>[], V, U>(
  this: Vertex<Ds, V>,
  binding: (self: Vertex<Ds, V>) => U,
) {
  return binding(this)
}
