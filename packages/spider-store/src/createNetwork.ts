import { Network } from './types'
import { SwapSet } from './SwapSet'
import { Slice } from './slice'

export function createNetwork(): Network {
  return {
    queuedUpdates: new SwapSet(),
    propagate() {
      propagateSlices(this.queuedUpdates)
    },
  }
}

function propagateSlices(marks: SwapSet<Slice<unknown>>) {
  while (!marks.isEmpty()) {
    propagateUpdate(marks.popMin()!, marks)
  }
}

function propagateUpdate(slice: Slice, marks: SwapSet<Slice<unknown>>) {
  const updated = slice.tryUpdate()
  if (updated) {
    for (let [, child] of slice.children.slices) {
      if (child.dependencies.length === 1) {
        propagateUpdate(child, marks)
      } else {
        marks.add(child)
      }
    }
  }
}
