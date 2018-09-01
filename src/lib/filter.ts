import { Vertex } from '../vertex/vertex'
import { MonoVertex } from '../vertex/monoVertex'
import { NullVertex } from '../vertex'

type Predicate<I, O extends I> = <V extends I>(
  item: V,
) => V extends O ? boolean : false

type Just = number | string | symbol | Object

declare module '../vertex/vertex' {
  interface Vertex<D = any, I = any, V extends Just = any> {
    filter<U extends V>(
      this: Vertex<D, I, V>,
      predicate: Predicate<V, U>,
    ): MonoVertex<Vertex<D, I, V>, V>
    filter<U extends V>(
      this: Vertex<D, I, V>,
      predicate: Predicate<V, U>,
      seed: U,
    ): MonoVertex<Vertex<D, I, V>, U>
  }
}

// TODO: type declarations
Vertex.prototype.filter = filter

function filter<D, I, V extends Just, O extends V>(
  this: Vertex<D, I, V>,
  predicate: Predicate<V, O>,
  seed?: O,
): MonoVertex<Vertex<D, I, V>, V> {
  const that = this
  return new MonoVertex(this, {
    create(value): V | null {
      return predicate(value) ? value : null
    },
    initialValue: seed !== undefined ? seed : that.cache,
  })
}
