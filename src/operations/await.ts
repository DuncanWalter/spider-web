// import { Slice, createSlice } from '../slice'
// import { propagateSlice } from '../propagateSlice'
// import { PrioritySet } from '../prioritySet'

// export const await = {
//   await<U, O>(this: Slice<Promise<U>, O>, initialValue: U): Slice<U, O> {
//     const awaiter = createSlice(
//       [this],
//       ([promise]) => {
//         promise
//           .then(v => {
//             awaiter.cachedOutput = v
//             awaiter.revoke()
//             const marks = new PrioritySet<Slice<any, any>>()
//             marks.add(awaiter)
//             propagateSlice(marks)
//           })
//           .catch(err => {
//             throw err
//           })
//         return null as null | U
//       },
//       {
//         initialValue,
//       },
//     )
//     return awaiter
//   },
// }
