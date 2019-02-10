import { Slice } from './slice'
import { SliceSet } from './SliceSet'

function propagateUpdate(slice: Slice, marks: SliceSet) {
  const updated = slice.tryUpdate()
  if (updated) {
    for (let subscription of slice.children.slices) {
      const slice = subscription.slice
      if (slice.dependencies.length === 1) {
        propagateUpdate(slice, marks)
      } else {
        marks.add(slice)
      }
    }
  }
}

export function propagateSlices(marks: SliceSet) {
  while (!marks.isEmpty()) {
    propagateUpdate(marks.popMin()!, marks)
  }
}
