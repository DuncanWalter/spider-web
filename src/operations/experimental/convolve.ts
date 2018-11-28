// import { createOperation } from './createOperation'
// import { Slice, createSlice } from '../slice'
// import { PrioritySet } from '../prioritySet'
// import { propagateSlice } from '../propagateSlice'

// const push = createOperation({
//   push<U>(this: Slice<U>, u: U) {
//     const marks = new PrioritySet<Slice>()
//     marks.add(this)
//     propagateSlice(marks)
//   },
// })

// export const convolve = createOperation({
//   convolve<U, V, O>(
//     this: Slice<Iterable<U>, O>,
//     convolution: (slice: Slice<U, O>) => Slice<V, O>,
//   ): Slice<IterableIterator<V>, O> {
//     let input: U
//     const head = createSlice([] as Slice<any, O>[], () => input).use(push)
//     const tail = convolution(head)

//     return createSlice([this], function*([us]) {
//       function noop() {}
//       tail.subscribe(noop)
//       for (let u of us) {
//         head.push(u)
//         yield tail.cachedOutput
//       }
//       tail.unsubscribe(noop)
//     })
//   },
// })
