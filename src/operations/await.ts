// import { Vertex, createVertex } from '../vertex'
// import { propagateVertex } from '../propagateVertex'
// import { PrioritySet } from '../prioritySet'

// export const await = {
//   await<U, O>(this: Vertex<Promise<U>, O>, initialValue: U): Vertex<U, O> {
//     const awaiter = createVertex(
//       [this],
//       ([promise]) => {
//         promise
//           .then(v => {
//             awaiter.cachedOutput = v
//             awaiter.revoke()
//             const marks = new PrioritySet<Vertex<any, any>>()
//             marks.add(awaiter)
//             propagateVertex(marks)
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
