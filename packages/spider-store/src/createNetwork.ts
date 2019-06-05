import { Network } from './types'
import { SwapSet } from './SwapSet'
import { Slice } from './slice'

export function createNetwork(): Network {
  const queuedUpdates = new SwapSet()

  return {
    enqueue(slice) {
      queuedUpdates.add(slice)
    },
    propagate() {
      while (!queuedUpdates.isEmpty()) {
        propagateUpdate(queuedUpdates.popMin()!)
      }
    },
  }
}

function propagateUpdate(slice: Slice) {
  if (slice.hasUpdate()) {
    for (let [, child] of slice.children.slices) {
      if (child.dependencies.length === 1) {
        propagateUpdate(child)
      } else {
        child.push()
      }
    }
  }
}
