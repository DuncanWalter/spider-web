// import { Slice } from './slice'

// export function terminateSlice(slice: Slice) {
//   while (!slice.children.isEmpty()) {
//     const child = slice.children.popMin()!
//     terminateSlice(child)
//   }
//   if (slice.subscriptions) {
//     for (let i = 0; i < slice.subscriptions.length; i++)
//       slice.dependencies[i].unsubscribe(slice.subscriptions[i])
//   }
// }
