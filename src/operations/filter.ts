// import { Vertex } from '../vertex'
// import { resolveVertex } from '../resolveVertex'

// declare module '../vertex' {
//   interface Vertex<Ds, V> {
//     filter<U extends V>(
//       this: Vertex<Ds, V>,
//       predicate: Predicate<V, U>,
//     ): Vertex<[Vertex<Ds, V>], V>
//     filter<U extends V>(
//       this: Vertex<Ds, V>,
//       predicate: Predicate<V, U>,
//       seed: U,
//     ): Vertex<[Vertex<Ds, V>], U>
//   }
// }

// type Predicate<I, O extends I> = (
//   item: I | O,
// ) => typeof item extends O ? boolean : false

// Vertex.prototype.filter = filter

// function filter<Ds extends Vertex<any, any>[], V, O extends V>(
//   this: Vertex<Ds, V>,
//   predicate: Predicate<V, O>,
//   seed?: O,
// ): Vertex<[Vertex<Ds, V>], V> {
//   const that = this
//   return new Vertex(
//     [this] as [Vertex<Ds, V>],
//     ([value]): V | null => {
//       return predicate(value) ? value : null
//     },
//     {
//       initialValue: seed !== undefined ? seed : resolveVertex(that),
//     },
//   )
// }
