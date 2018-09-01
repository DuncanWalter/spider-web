import { Vertex } from '../vertex/vertex'
import { MonoVertex } from '../vertex/monoVertex'

type Just = number | string | symbol | Object

declare module '../vertex/vertex' {
  interface Vertex<D = any, I = any, V extends Just = any> {
    map<O>(
      this: Vertex<D, I, V>,
      mapping: (value: V) => O,
    ): MonoVertex<Vertex<D, I, V>, O>
  }
}

Vertex.prototype.map = function<I, O>(
  this: Vertex<any, any, I>,
  mapping: (value: I) => O,
) {
  return new MonoVertex(this, value => mapping(value))
}
