import { Vertex } from '../vertex/vertex'

declare module '../vertex/vertex' {
  interface Vertex<Ds, V> {
    map<U>(
      this: Vertex<Ds, V>,
      mapping: (value: V) => U,
    ): Vertex<[Vertex<Ds, V>], U>
  }
}

Vertex.prototype.map = function<Ds extends Vertex<any, any>[], V, U>(
  this: Vertex<Ds, V>,
  mapping: (value: V) => U,
) {
  return new Vertex([this] as [Vertex<Ds, V>], ([value]) => mapping(value))
}
