import { Vertex } from '../vertex/vertex'
import { MonoVertex } from '../vertex/monoVertex'

type Predicate<I, O extends I> = (item: I) => I extends O ? boolean : false

declare module '../vertex/vertex' {
  interface Vertex<D = any, I = any, V = D> {
    filter<U extends V>(
      this: Vertex<D, I, V>,
      predicate: Predicate<V, U>,
    ): MonoVertex<Vertex<D, I, V>, U>
  }
}

// TODO: type declarations
Vertex.prototype.filter = function<I, O extends I>(
  this: Vertex<any, any, I>,
  predicate: Predicate<I, O>,
) {
  return new MonoVertex(this, value => (predicate(value) ? value : null))
}
