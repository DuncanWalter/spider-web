// import { Slice } from '../slice'
// import { resolveSlice } from '../resolveSlice'

// declare module '../slice' {
//   interface Slice<Ds, V> {
//     filter<U extends V>(
//       this: Slice<Ds, V>,
//       predicate: Predicate<V, U>,
//     ): Slice<[Slice<Ds, V>], V>
//     filter<U extends V>(
//       this: Slice<Ds, V>,
//       predicate: Predicate<V, U>,
//       seed: U,
//     ): Slice<[Slice<Ds, V>], U>
//   }
// }

// type Predicate<I, O extends I> = (
//   item: I | O,
// ) => typeof item extends O ? boolean : false

// Slice.prototype.filter = filter

// function filter<Ds extends Slice<any, any>[], V, O extends V>(
//   this: Slice<Ds, V>,
//   predicate: Predicate<V, O>,
//   seed?: O,
// ): Slice<[Slice<Ds, V>], V> {
//   const that = this
//   return new Slice(
//     [this] as [Slice<Ds, V>],
//     ([value]): V | null => {
//       return predicate(value) ? value : null
//     },
//     {
//       initialValue: seed !== undefined ? seed : resolveSlice(that),
//     },
//   )
// }
